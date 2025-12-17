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

    // 先创建待支付订单记录到数据库
    const pendingOrderIds: string[] = [];

    for (const order of ordersData) {
      // 创建订单记录（状态为 pending_payment）
      const { data: orderRecord, error: orderError } = await supabase
        .from("orders")
        .insert({
          parent_id: user.id,
          child_id: order.childId,
          order_date: order.date,
          total_amount: order.total,
          status: "pending_payment", // 等待支付
          fulfillment_status: "pending_delivery",
        })
        .select()
        .single();

      if (orderError || !orderRecord) {
        console.error("Error creating order:", orderError);
        throw new Error("Failed to create order record");
      }

      // 创建订单项（注意：表名是 order_details，字段是 unit_price_at_time_of_order）
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
        throw new Error("Failed to create order items");
      }

      pendingOrderIds.push(orderRecord.id);
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
        order_ids: pendingOrderIds.join(","), // 只保存订单ID列表，避免超过500字符限制
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
