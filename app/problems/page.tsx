import Link from "next/link";
import { supabase } from "@/lib/supabase";

type SearchParams = Promise<{
  sort?: string;
}>;

function gradeToNumber(grade: string) {
  return Number(grade.replace("V", ""));
}

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { sort } = await searchParams;

  const { data: problems, error } = await supabase
    .from("problems")
    .select("*");

  if (error) {
    return <div className="p-8">문제 목록을 불러오지 못했습니다.</div>;
  }

  let sortedProblems = [...(problems ?? [])];

  if (sort === "grade") {
    sortedProblems.sort(
      (a, b) => gradeToNumber(a.grade) - gradeToNumber(b.grade)
    );
  } else {
    sortedProblems.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900">전체 문제 보기</h1>

        <div className="mt-6 flex gap-3">
          <Link
            href="/problems?sort=recent"
            className={`rounded-xl px-4 py-2 shadow ${
              sort !== "grade"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-900"
            }`}
          >
            최근 순
          </Link>

          <Link
            href="/problems?sort=grade"
            className={`rounded-xl px-4 py-2 shadow ${
              sort === "grade"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-900"
            }`}
          >
            난이도 순
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {sortedProblems.map((problem) => (
            <Link
              key={problem.id}
              href={`/problems/${problem.id}`}
              className="block rounded-2xl bg-white p-6 shadow hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">{problem.title}</p>
                <span className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium">
                  {problem.grade}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                출제자: {problem.setter}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {problem.description}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                {new Date(problem.created_at).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}