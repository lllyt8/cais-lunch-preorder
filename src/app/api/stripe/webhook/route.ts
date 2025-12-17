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

        // 处理订单支付 - 支付成功后更新订单状态
        if (session.metadata?.order_ids) {
          const orderIds = session.metadata.order_ids.split(",");

          // 更新所有订单状态为已支付（注意：数据库中没有 payment_status 字段）
          const { error: updateError } = await supabase
            .from("orders")
            .update({
              status: "confirmed",
              fulfillment_status: "pending_delivery",
              stripe_payment_intent_id: session.payment_intent as string,
            })
            .in("id", orderIds);

          if (updateError) {
            console.error("Error updating orders:", updateError);
          } else {
            console.log(`Orders ${orderIds.join(", ")} marked as paid`);
          }
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;

        // 取消过期的待支付订单
        if (session.metadata?.order_ids) {
          const orderIds = session.metadata.order_ids.split(",");

          const { error: cancelError } = await supabase
            .from("orders")
            .update({
              status: "cancelled",
            })
            .in("id", orderIds);

          if (cancelError) {
            console.error("Error cancelling orders:", cancelError);
          } else {
            console.log(`Orders ${orderIds.join(", ")} cancelled due to session expiry`);
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
