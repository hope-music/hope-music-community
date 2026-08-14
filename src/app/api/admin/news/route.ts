import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";

export interface NewsRow {
  id: string;
  title: string;
  content: string;
  cover_image: string | null;
  excerpt: string | null;
  author: string | null;
  author_email: string | null;
  is_published: boolean;
  is_featured: boolean;
}

export async function GET() {
  const admin = getSupabaseServiceClient();
  const { data, error } = await admin
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(request: NextRequest) {
  const admin = getSupabaseServiceClient();
  const body = await request.json();
  const { title, content, coverImage, excerpt, authorName, authorEmail, isPublished, isFeatured } = body || {};
  if (!title || !content) {
    return NextResponse.json({ error: "title and content are required" }, { status: 400 });
  }
  const { data, error } = await admin
    .from("news")
    .insert({
      title,
      content,
      cover_image: coverImage || null,
      excerpt: excerpt || null,
      author: authorName || null,
      author_email: authorEmail || null,
      is_published: isPublished ?? true,
      is_featured: isFeatured ?? false,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data?.id });
}
