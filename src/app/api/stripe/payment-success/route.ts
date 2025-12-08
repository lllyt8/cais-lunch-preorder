import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 验证用户登录
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // 验证 Stripe Session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // 获取订单IDs from metadata
    const orderIdsStr = session.metadata?.order_ids;
    if (!orderIdsStr) {
      return NextResponse.json(
        { error: "No order IDs found in session" },
        { status: 400 }
      );
    }

    const orderIds = orderIdsStr.split(",");

    // 更新订单状态为已支付
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .in("id", orderIds)
      .eq("parent_id", user.id);

    if (updateError) {
      console.error("Error updating orders:", updateError);
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: "Orders updated successfully",
      orderIds,
    });
  } catch (error: unknown) {
    console.error("Error processing payment success:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process payment";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
