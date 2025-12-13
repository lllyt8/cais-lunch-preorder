import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = await createClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // 处理订单支付 - 支付成功后创建订单
        if (session.metadata?.orders_data) {
          const userId = session.metadata.user_id;
          const ordersData = JSON.parse(session.metadata.orders_data);

          // 为每个订单创建数据库记录
          for (const orderData of ordersData) {
            // 创建订单
            const { data: order, error: orderError } = await supabase
              .from("orders")
              .insert({
                parent_id: userId,
                child_id: orderData.childId,
                order_date: orderData.date,
                total_amount: orderData.total,
                status: "paid", // 直接标记为已支付
                fulfillment_status: "pending_delivery",
                stripe_payment_intent_id: session.payment_intent as string,
                special_requests: orderData.specialRequests,
              })
              .select()
              .single();

            if (orderError) {
              console.error("Error creating order:", orderError);
              continue;
            }

            // 创建订单详情
            const orderDetails = orderData.items.map((item: any) => ({
              order_id: order.id,
              menu_item_id: item.menu_item_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              portion: item.portion,
            }));

            const { error: detailsError } = await supabase
              .from("order_details")
              .insert(orderDetails);

            if (detailsError) {
              console.error("Error creating order details:", detailsError);
            } else {
              console.log(`Order ${order.id} created and marked as paid`);
            }
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment failed:", paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
