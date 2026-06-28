import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const sb = createClient(url, key);
  const { data } = await sb
    .from("dance_events")
    .select("title,venue,event_date,segment,genre,sub_category")
    .eq("region","US")
    .limit(8);
  return NextResponse.json({ sample: data });
}