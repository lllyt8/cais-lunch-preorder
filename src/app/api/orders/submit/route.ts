import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

    // 获取请求数据
    const body = await request.json();
    const { orders } = body; // orders 是一个数组，每个元素包含 childId, date, items, total

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { error: "No orders to submit" },
        { status: 400 }
      );
    }

    // 创建订单记录
    const createdOrders = [];

    for (const orderData of orders) {
      const { childId, date, items, total, specialRequests } = orderData;

      // 创建订单
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          parent_id: user.id,
          child_id: childId,
          order_date: date,
          total_amount: total,
          status: "pending_payment",
          fulfillment_status: "pending_delivery",
          special_requests: specialRequests || null,
        })
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        throw orderError;
      }

      // 创建订单详情
      const orderDetails = items.map((item: any) => ({
        order_id: order.id,
        menu_item_id: item.menu_item.id,
        quantity: item.quantity,
        portion_type: item.portion_type,
        unit_price_at_time_of_order: item.unit_price,
      }));

      const { error: detailsError } = await supabase
        .from("order_details")
        .insert(orderDetails);

      if (detailsError) {
        console.error("Error creating order details:", detailsError);
        // 如果订单详情创建失败，删除订单
        await supabase.from("orders").delete().eq("id", order.id);
        throw detailsError;
      }

      createdOrders.push(order);
    }

    return NextResponse.json({
      success: true,
      orders: createdOrders,
      message: `Successfully created ${createdOrders.length} order(s)`,
    });
  } catch (error: any) {
    console.error("Error submitting orders:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit orders" },
      { status: 500 }
    );
  }
}
