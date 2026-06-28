import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const sb = createClient(url, key);

  const CATS = [
    "musical","opera","classical","concert","electronic",
    "pop","rock","hip_hop_rap","country","latin","dance","other",
  ];
  const REGIONS = ["US","international"] as const;
  const today = new Date().toISOString().slice(0, 10);

  const rows: any[] = [];
  let grandTotal = 0, grandPast = 0, grandFuture = 0;

  for (const cat of CATS) {
    const t = `${cat}_events`;
    for (const r of REGIONS) {
      const { count: total } = await sb.from(t).select("*", { count: "exact", head: true }).eq("region", r);
      const { count: past }  = await sb.from(t).select("*", { count: "exact", head: true }).eq("region", r).lt("event_date", today);
      const totalN = total ?? 0;
      const pastN = past ?? 0;
      const futureN = totalN - pastN;
      grandTotal += totalN; grandPast += pastN; grandFuture += futureN;
      rows.push({ table: t, region: r, total: totalN, past: pastN, future: futureN });
    }
  }
  return NextResponse.json({ today, rows, grand: { total: grandTotal, past: grandPast, future: grandFuture } });
}