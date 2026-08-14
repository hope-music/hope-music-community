// ============================================
// Storage - Supabase Storage for images
// ============================================
import { supabaseAdmin } from "./supabase-admin";

const BUCKET_NAME = "images";

export async function uploadImage(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

export async function deleteImage(url: string): Promise<void> {
  // Extract file name from URL
  const urlObj = new URL(url);
  const fileName = urlObj.pathname.split("/").pop();
  if (!fileName) return;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .remove([fileName]);

  if (error) {
    console.error("Delete error:", error);
  }
}

export function getPublicUrl(fileName: string): string {
  const { data } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);
  return data.publicUrl;
}
