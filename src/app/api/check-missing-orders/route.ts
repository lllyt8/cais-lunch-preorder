import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { childId, weekDates } = await request.json();

    if (!childId || !weekDates || !Array.isArray(weekDates)) {
      return NextResponse.json(
        { error: "Missing required fields: childId and weekDates" },
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

    // Get existing orders for this child in the specified week
    const { data: existingOrders, error } = await supabase
      .from("orders")
      .select("order_date")
      .eq("child_id", childId)
      .eq("parent_id", user.id)
      .in("order_date", weekDates);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const orderedDates = existingOrders?.map((o) => o.order_date) || [];
    const missingDates = weekDates.filter(
      (date) => !orderedDates.includes(date)
    );

    return NextResponse.json({
      missingDates,
      orderedDates,
      hasMissingOrders: missingDates.length > 0,
    });
  } catch (error) {
    console.error("Error checking missing orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
