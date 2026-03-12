"use server";

import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

export async function createProblem(formData: FormData) {
  const title = formData.get("title")?.toString() ?? "";
  const grade = formData.get("grade")?.toString() ?? "";
  const setter = formData.get("setter")?.toString() ?? "";
  const description = formData.get("description")?.toString() ?? "";
  const imageFile = formData.get("imageFile") as File | null;

  if (!title || !grade || !setter || !description || !imageFile || imageFile.size === 0) {
    throw new Error("모든 항목을 입력해야 합니다.");
  }

  const fileExt = imageFile.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `problems/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("problem-images")
    .upload(filePath, imageFile, {
      contentType: imageFile.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from("problem-images")
    .getPublicUrl(filePath);

  const image = publicUrlData.publicUrl;

  const { error: insertError } = await supabase.from("problems").insert([
    {
      title,
      grade,
      setter,
      description,
      image,
    },
  ]);

  if (insertError) {
    throw new Error(`문제 저장 실패: ${insertError.message}`);
  }

  redirect(`/grades/${grade}`);
}