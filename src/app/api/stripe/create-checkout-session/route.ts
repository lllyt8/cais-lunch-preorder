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
    const { ordersData, successUrl, cancelUrl } = body;

    if (!ordersData || ordersData.length === 0) {
      return NextResponse.json(
        { error: "No orders provided" },
        { status: 400 }
      );
    }

    // 验证订单总额
    const totalAmount = ordersData.reduce((sum: number, order: any) => sum + order.total, 0);
    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: "Order total must be greater than $0" },
        { status: 400 }
      );
    }

    // Stripe 要求最低金额为 $0.50
    if (totalAmount < 0.50) {
      return NextResponse.json(
        { error: "Order total must be at least $0.50" },
        { status: 400 }
      );
    }

    // 将订单数据保存到临时表
    const { data: sessionData, error: sessionError } = await supabase
      .from("checkout_sessions")
      .insert({
        user_id: user.id,
        orders_data: ordersData,
      })
      .select()
      .single();

    if (sessionError || !sessionData) {
      console.error("Error creating checkout session data:", sessionError);
      return NextResponse.json(
        { error: "Failed to save order data" },
        { status: 500 }
      );
    }

    // 创建 line items（基于购物车数据）
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      ordersData.map((order: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: `Order for ${order.date}`,
            description: `${order.items.length} items`,
          },
          unit_amount: Math.round(order.total * 100), // Convert to cents
        },
        quantity: 1,
      }));

    // 创建 Checkout Session
    const session = await stripe.checkout.sessions.create({
      // 支持多种支付方式：信用卡、Apple Pay、Google Pay
      payment_method_types: ["card", "link"],
      line_items: lineItems,
      mode: "payment",
      success_url:
        successUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders?payment_success=true`,
      cancel_url:
        cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/cart`,
      metadata: {
        user_id: user.id,
        session_data_id: sessionData.id, // 只存储临时表的 ID
      },
      customer_email: user.email,
      ui_mode: "hosted",
      locale: "en",
      // 启用数字钱包（Apple Pay, Google Pay）
      payment_method_options: {
        card: {
          request_three_d_secure: "automatic",
        },
      },
      // 自定义文本
      custom_text: {
        submit: {
          message: "Secure payment powered by Stripe",
        },
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to create checkout session";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
