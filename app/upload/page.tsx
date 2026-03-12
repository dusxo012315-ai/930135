import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default function UploadPage() {
  async function createProblem(formData: FormData) {
    "use server";

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

    revalidatePath(`/grades/${grade}`);
    redirect(`/grades/${grade}`);
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-gray-900">문제 업로드</h1>
        <p className="mt-2 text-gray-600">
          출제자가 새로운 볼더링 문제를 등록하는 페이지입니다.
        </p>

        <form action={createProblem} className="mt-8 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              문제 제목
            </label>
            <input
              type="text"
              name="title"
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              난이도
            </label>
            <select
              name="grade"
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            >
              <option value="V0">V0</option>
              <option value="V1">V1</option>
              <option value="V2">V2</option>
              <option value="V3">V3</option>
              <option value="V4">V4</option>
              <option value="V5">V5</option>
              <option value="V6">V6</option>
              <option value="V7">V7</option>
              <option value="V8">V8</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              출제자
            </label>
            <input
              type="text"
              name="setter"
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              설명
            </label>
            <textarea
              name="description"
              rows={5}
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              문제 사진
            </label>
            <input
              type="file"
              name="imageFile"
              accept="image/*"
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gray-900 px-4 py-3 text-white"
          >
            문제 등록
          </button>
        </form>
      </div>
    </main>
  );
}