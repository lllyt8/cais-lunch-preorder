// Supabase Edge Function for Birthday Wishes
// Deploy with: supabase functions deploy birthday-wishes
// Schedule as Cron Job in Supabase Dashboard: 0 8 * * * (daily at 8 AM)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  birthday: string;
  parent_id: string;
}

interface User {
  id: string;
  email: string;
  phone_number?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get today's date in MM-DD format for birthday matching
    const today = new Date();
    const monthDay = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;

    // Find children with birthdays today
    // Note: This query matches the month and day portion of the birthday
    const { data: birthdayChildren, error: childrenError } = await supabase
      .from("children")
      .select("id, first_name, last_name, birthday, parent_id")
      .not("birthday", "is", null);

    if (childrenError) {
      throw childrenError;
    }

    // Filter children whose birthday matches today (month and day)
    const todaysBirthdays = (birthdayChildren as Child[]).filter((child) => {
      if (!child.birthday) return false;
      const birthday = new Date(child.birthday);
      const childMonthDay = `${String(birthday.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(birthday.getDate()).padStart(2, "0")}`;
      return childMonthDay === monthDay;
    });

    if (todaysBirthdays.length === 0) {
      return new Response(
        JSON.stringify({ message: "No birthdays today", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get parent emails for birthday children
    const parentIds = [...new Set(todaysBirthdays.map((c) => c.parent_id))];
    const { data: parents, error: parentsError } = await supabase
      .from("users")
      .select("id, email, phone_number")
      .in("id", parentIds);

    if (parentsError) {
      throw parentsError;
    }

    const parentMap = new Map((parents as User[]).map((p) => [p.id, p]));

    // Send birthday wishes
    const results = [];
    for (const child of todaysBirthdays) {
      const parent = parentMap.get(child.parent_id);
      if (!parent) continue;

      // Generate a simple gift code
      const giftCode = `BDAY${child.id
        .slice(0, 4)
        .toUpperCase()}${today.getFullYear()}`;

      // Here you would integrate with Resend or Twilio
      // For now, we'll log the birthday wish
      const childFullName = `${child.first_name} ${child.last_name}`;
      const birthdayMessage = {
        to: parent.email,
        subject: `🎂 Happy Birthday to ${childFullName}!`,
        body: `
          Dear Parent,

          We want to wish ${childFullName} a very Happy Birthday! 🎉

          As a special gift, here's a $5 credit code for your next lunch order:

          Gift Code: ${giftCode}

          We hope ${childFullName} has a wonderful day filled with joy and delicious food!

          Best wishes,
          CAIS Lunch Team
        `,
        giftCode,
        childName: childFullName,
      };

      // TODO: Integrate with Resend API
      // const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
      // await resend.emails.send({
      //   from: 'CAIS Lunch <noreply@cais-lunch.com>',
      //   to: parent.email,
      //   subject: birthdayMessage.subject,
      //   html: birthdayMessage.body,
      // })

      // TODO: Integrate with Twilio for SMS
      // if (parent.phone_number) {
      //   const twilio = require('twilio')(
      //     Deno.env.get('TWILIO_ACCOUNT_SID'),
      //     Deno.env.get('TWILIO_AUTH_TOKEN')
      //   )
      //   await twilio.messages.create({
      //     body: `🎂 Happy Birthday to ${childFullName}! Use code ${giftCode} for $5 off your next CAIS Lunch order!`,
      //     from: Deno.env.get('TWILIO_PHONE_NUMBER'),
      //     to: parent.phone_number,
      //   })
      // }

      // Log for now (in production, remove this and use actual email/SMS)
      console.log("Birthday wish prepared:", birthdayMessage);

      // Add gift credit to parent's account
      await supabase
        .from("users")
        .update({
          account_balance: supabase.rpc("increment_balance", {
            user_id: parent.id,
            amount: 5.0,
          }),
        })
        .eq("id", parent.id);

      results.push({
        childName: childFullName,
        parentEmail: parent.email,
        giftCode,
        status: "sent",
      });
    }

    return new Response(
      JSON.stringify({
        message: `Birthday wishes sent to ${results.length} families`,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in birthday-wishes function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
