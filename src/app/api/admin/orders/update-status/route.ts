import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    // 验证管理员权限
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 检查用户是否是管理员
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      userError ||
      !userData ||
      !["admin", "restaurant_staff"].includes(userData.role)
    ) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, status, fulfillmentStatus } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // 准备更新数据
    const updateData: { status?: string; fulfillment_status?: string } = {};
    if (status) updateData.status = status;
    if (fulfillmentStatus) updateData.fulfillment_status = fulfillmentStatus;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // 更新订单状态
    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating order:", updateError);
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      order,
      message: "Order status updated successfully",
    });
  } catch (error: unknown) {
    console.error("Error updating order status:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update order status";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
