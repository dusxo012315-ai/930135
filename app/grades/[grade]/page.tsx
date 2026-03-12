import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function GradePage({
  params,
}: {
  params: Promise<{ grade: string }>;
}) {
  const { grade } = await params;

  const { data: problems } = await supabase
    .from("problems")
    .select("*")
    .eq("grade", grade);

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">{grade} 문제 목록</h1>

        <div className="mt-8 space-y-4">
          {problems?.map((problem) => (
            <Link
              key={problem.id}
              href={`/problems/${problem.id}`}
              className="block rounded-2xl bg-white p-6 shadow hover:bg-gray-50"
            >
              <p className="text-lg font-semibold">{problem.title}</p>
              <p className="mt-2 text-sm text-gray-500">
                출제자: {problem.setter}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {problem.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}