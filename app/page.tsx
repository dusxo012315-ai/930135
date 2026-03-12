import Link from "next/link";

export default function Home() {
  const grades = ["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8"];

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          학교 암벽장 볼더링 문제집
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          QR코드로 접속해서 난이도별 문제를 확인하세요.
        </p>

        <div className="mt-10 grid grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {grades.map((grade) => (
            <Link
              key={grade}
              href={`/grades/${grade}`}
              className="rounded-xl bg-white px-4 py-6 text-lg font-semibold shadow hover:bg-gray-50"
            >
              {grade}
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/upload"
            className="rounded-xl bg-gray-900 px-6 py-3 text-white hover:bg-gray-800"
          >
            문제 업로드
          </Link>
        </div>
      </div>
    </main>
  );
}