import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  const out: any = {};
  for (const table of ["musical_events","opera_events","classical_events","concert_events","electronic_events","pop_events","rock_events","hip_hop_rap_events","country_events","latin_events","dance_events","other_events"]) {
    const { count } = await sb.from(table).select("ticketmaster_id", { count: "exact", head: true }).eq("region", "US");
    const { count: intl } = await sb.from(table).select("ticketmaster_id", { count: "exact", head: true }).eq("region", "international");
    out[table] = { US: count, international: intl };
  }
  return NextResponse.json(out);
}