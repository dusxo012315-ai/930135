import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function EditProblemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: problem, error } = await supabase
    .from("problems")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !problem) {
    return <div className="p-8">문제를 찾을 수 없습니다.</div>;
  }

  async function updateProblem(formData: FormData) {
    "use server";

    const title = formData.get("title")?.toString() ?? "";
    const grade = formData.get("grade")?.toString() ?? "";
    const description = formData.get("description")?.toString() ?? "";
    const imageFile = formData.get("imageFile") as File | null;

    if (!title || !grade || !description) {
      throw new Error("제목, 난이도, 설명은 모두 입력해야 합니다.");
    }

    // 기존 문제 정보 다시 조회
    const { data: currentProblem, error: fetchError } = await supabase
      .from("problems")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !currentProblem) {
      throw new Error("기존 문제 정보를 불러오지 못했습니다.");
    }

    let imageUrl = currentProblem.image;

    // 새 사진이 업로드된 경우에만 이미지 교체
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${fileExt}`;
      const filePath = `problems/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("problem-images")
        .upload(filePath, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`새 이미지 업로드 실패: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from("problem-images")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;

      // 기존 이미지 삭제 시도
      const marker = "/storage/v1/object/public/problem-images/";
      const oldImagePath = currentProblem.image?.includes(marker)
        ? currentProblem.image.split(marker)[1]
        : null;

      if (oldImagePath) {
        await supabase.storage.from("problem-images").remove([oldImagePath]);
      }
    }

    const oldGrade = currentProblem.grade;

    const { error: updateError } = await supabase
      .from("problems")
      .update({
        title,
        grade,
        description,
        image: imageUrl,
      })
      .eq("id", id);

    if (updateError) {
      throw new Error(`문제 수정 실패: ${updateError.message}`);
    }

    revalidatePath(`/problems/${id}`);
    revalidatePath(`/problems`);
    revalidatePath(`/grades/${grade}`);
    if (oldGrade && oldGrade !== grade) {
      revalidatePath(`/grades/${oldGrade}`);
    }

    redirect(`/problems/${id}`);
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-gray-900">문제 수정</h1>

        <p className="mt-3 text-gray-600">
          제목, 난이도, 설명, 사진을 수정할 수 있습니다.
        </p>

        <form action={updateProblem} className="mt-8 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              문제 제목
            </label>
            <input
              type="text"
              name="title"
              defaultValue={problem.title}
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              난이도
            </label>
            <select
              name="grade"
              defaultValue={problem.grade}
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
              설명
            </label>
            <textarea
              name="description"
              rows={5}
              defaultValue={problem.description}
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              현재 사진
            </label>
            <img
              src={problem.image}
              alt={problem.title}
              className="mb-4 w-full rounded-xl"
            />

            <label className="mb-2 block text-sm font-medium text-gray-700">
              새 사진 업로드 (선택)
            </label>
            <input
              type="file"
              name="imageFile"
              accept="image/*"
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />
            <p className="mt-2 text-sm text-gray-500">
              사진을 바꾸지 않으려면 비워 두세요.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gray-900 px-4 py-3 text-white hover:bg-gray-800"
          >
            수정 저장
          </button>
        </form>
      </div>
    </main>
  );
}