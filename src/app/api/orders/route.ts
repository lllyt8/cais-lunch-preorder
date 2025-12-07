import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { childId, orderDate, items, specialRequests } = await request.json();

    if (!childId || !orderDate || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum: number, item: { unit_price: number; quantity: number }) =>
        sum + item.unit_price * item.quantity,
      0
    );

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        parent_id: user.id,
        child_id: childId,
        order_date: orderDate,
        total_amount: totalAmount,
        special_requests: specialRequests || null,
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Create order details
    const orderDetails = items.map(
      (item: {
        menu_item_id: string;
        quantity: number;
        portion_type: string;
      }) => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        portion_type: item.portion_type,
      })
    );

    const { error: detailsError } = await supabase
      .from("order_details")
      .insert(orderDetails);

    if (detailsError) {
      // Rollback order if details fail
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: detailsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        children (*),
        order_details (
          *,
          menu_items (*)
        )
      `
      )
      .eq("parent_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
