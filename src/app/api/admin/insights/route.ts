import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";

export async function GET() {
  const admin = getSupabaseServiceClient();
  const { data, error } = await admin
    .from("insights")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(request: NextRequest) {
  const admin = getSupabaseServiceClient();
  const body = await request.json();
  const { title, content, coverImage, excerpt, category, authorName, isPublished, isFeatured, publishDate } = body || {};
  if (!title || !content) {
    return NextResponse.json({ error: "title and content are required" }, { status: 400 });
  }
  const publishDateValue = publishDate ? new Date(publishDate).toISOString() : new Date().toISOString();
  const { data, error } = await admin
    .from("insights")
    .insert({
      title,
      content,
      cover_image: coverImage || null,
      excerpt: excerpt || null,
      category: category || "general",
      author: authorName || null,
      is_published: isPublished ?? false,
      is_featured: isFeatured ?? false,
      publish_date: publishDateValue,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data?.id });
}
