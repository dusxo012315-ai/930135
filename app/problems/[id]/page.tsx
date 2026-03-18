import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import DeleteButton from "./DeleteButton";

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: problem } = await supabase
    .from("problems")
    .select("*")
    .eq("id", id)
    .single();

  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .eq("problem_id", id)
    .order("created_at", { ascending: false });

  async function createComment(formData: FormData) {
    "use server";

    const author = formData.get("author")?.toString() ?? "";
    const content = formData.get("content")?.toString() ?? "";

    if (!author || !content) {
      throw new Error("이름과 댓글 내용을 입력해야 합니다.");
    }

    const { error } = await supabase.from("comments").insert([
      {
        problem_id: id,
        author,
        content,
      },
    ]);

    if (error) {
      throw new Error(`댓글 저장 실패: ${error.message}`);
    }

    revalidatePath(`/problems/${id}`);
  }

  async function deleteProblem() {
    "use server";

    const { data: targetProblem } = await supabase
      .from("problems")
      .select("*")
      .eq("id", id)
      .single();

    if (!targetProblem) {
      throw new Error("삭제할 문제를 찾을 수 없습니다.");
    }

    const marker = "/storage/v1/object/public/problem-images/";
    const imagePath = targetProblem.image.includes(marker)
      ? targetProblem.image.split(marker)[1]
      : null;

    if (imagePath) {
      await supabase.storage.from("problem-images").remove([imagePath]);
    }

    const { error } = await supabase.from("problems").delete().eq("id", id);

    if (error) {
      throw new Error(`문제 삭제 실패: ${error.message}`);
    }

    revalidatePath(`/grades/${targetProblem.grade}`);
    redirect(`/grades/${targetProblem.grade}`);
  }

  if (!problem) {
    return <div>문제를 찾을 수 없습니다.</div>;
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900">{problem.title}</h1>

        <div className="mt-4 flex gap-3">
          <Link
            href={`/problems/${id}/edit`}
            className="rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            문제 수정
          </Link>

          <form action={deleteProblem}>
            <DeleteButton />
          </form>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow">
          <img
            src={problem.image}
            alt={problem.title}
            className="w-full rounded-xl"
          />

          <div className="mt-6 space-y-2">
            <p className="text-sm text-gray-500">난이도: {problem.grade}</p>
            <p className="text-sm text-gray-500">출제자: {problem.setter}</p>
            <p className="text-sm text-gray-500">{problem.description}</p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-white p-6 shadow">
          <h2 className="text-2xl font-bold text-gray-900">댓글</h2>

          <form action={createComment} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                type="text"
                name="author"
                placeholder="이름을 입력하세요"
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                댓글 내용
              </label>
              <textarea
                name="content"
                rows={4}
                placeholder="댓글을 입력하세요"
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-gray-900 px-6 py-3 text-white hover:bg-gray-800"
            >
              댓글 등록
            </button>
          </form>

          <div className="mt-8 space-y-4">
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <p className="font-semibold text-gray-900">{comment.author}</p>
                  <p className="mt-2 text-gray-700">{comment.content}</p>
                  <p className="mt-2 text-sm text-gray-400">
                    {new Date(comment.created_at).toLocaleString("ko-KR", {
                      timeZone: "Asia/Seoul",
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">아직 댓글이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}