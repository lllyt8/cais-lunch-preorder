import { createServiceRoleClient } from "@/lib/supabase/server";
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

    // Use service role client to bypass RLS since webhooks are called by Stripe
    const supabase = createServiceRoleClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // 支付成功后创建订单
        const sessionDataId = session.metadata?.session_data_id;
        const userId = session.metadata?.user_id;

        if (!sessionDataId || !userId) {
          console.error("Missing session_data_id or user_id in session metadata");
          break;
        }

        try {
          // 从临时表读取订单数据
          const { data: sessionData, error: sessionError } = await supabase
            .from("checkout_sessions")
            .select("orders_data")
            .eq("id", sessionDataId)
            .eq("user_id", userId)
            .single();

          if (sessionError || !sessionData) {
            console.error("Error fetching session data:", sessionError);
            break;
          }

          const ordersData = sessionData.orders_data;

          // 为每个订单创建数据库记录
          for (const order of ordersData) {
            // 创建订单记录（状态直接为 paid）
            const { data: orderRecord, error: orderError } = await supabase
              .from("orders")
              .insert({
                parent_id: userId,
                child_id: order.childId,
                order_date: order.date,
                total_amount: order.total,
                status: "paid", // 直接设置为已支付
                fulfillment_status: "pending_delivery",
                stripe_payment_intent_id: session.payment_intent as string,
              })
              .select()
              .single();

            if (orderError || !orderRecord) {
              console.error("Error creating order:", orderError);
              continue; // 继续处理其他订单
            }

            // 创建订单详情
            const orderItems = order.items.map((item: any) => ({
              order_id: orderRecord.id,
              menu_item_id: item.menu_item_id,
              quantity: item.quantity,
              unit_price_at_time_of_order: item.unit_price,
              portion_type: item.portion,
            }));

            const { error: itemsError } = await supabase
              .from("order_details")
              .insert(orderItems);

            if (itemsError) {
              console.error("Error creating order items:", itemsError);
              // 如果订单详情创建失败，删除订单
              await supabase.from("orders").delete().eq("id", orderRecord.id);
            } else {
              console.log(`Order ${orderRecord.id} created successfully for ${order.date}`);
            }
          }

          // 订单创建成功后，删除临时数据
          await supabase
            .from("checkout_sessions")
            .delete()
            .eq("id", sessionDataId);

        } catch (error) {
          console.error("Error processing orders from checkout session:", error);
        }
        break;
      }

      case "checkout.session.expired": {
        // 支付会话过期 - 清理临时数据
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionDataId = session.metadata?.session_data_id;

        if (sessionDataId) {
          await supabase
            .from("checkout_sessions")
            .delete()
            .eq("id", sessionDataId);
          console.log(`Checkout session expired - cleaned up session data ${sessionDataId}`);
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
