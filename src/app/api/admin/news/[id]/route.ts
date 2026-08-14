import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = getSupabaseServiceClient();
  const { id } = await params;
  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.content !== undefined) updates.content = body.content;
  if (body.coverImage !== undefined) updates.cover_image = body.coverImage;
  if (body.excerpt !== undefined) updates.excerpt = body.excerpt;
  if (body.authorName !== undefined) updates.author = body.authorName;
  if (body.isPublished !== undefined) updates.is_published = body.isPublished;
  if (body.isFeatured !== undefined) updates.is_featured = body.isFeatured;
  if (body.publishDate !== undefined) updates.publish_date = new Date(body.publishDate).toISOString();

  const { error } = await admin.from("news").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = getSupabaseServiceClient();
  const { id } = await params;
  const { error } = await admin.from("news").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
