import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";

export async function GET() {
  const admin = getSupabaseServiceClient();
  const { data, error } = await admin
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(request: NextRequest) {
  const admin = getSupabaseServiceClient();
  const body = await request.json();
  const { email, username, avatar, role } = body || {};
  if (!email || !username || !role) {
    return NextResponse.json({ error: "email, username, role are required" }, { status: 400 });
  }
  const { data, error } = await admin
    .from("users")
    .insert({ email, username, avatar: avatar || "", role, status: "active" })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data?.id });
}
