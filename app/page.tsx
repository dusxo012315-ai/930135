import Link from "next/link";

export default function Home() {
  const grades = ["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8"];

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-8 shadow">
          <h1 className="text-center text-4xl font-bold text-gray-900">
            인하대학교 산악부 볼더링 문제집
          </h1>

          <p className="mt-4 text-center text-lg text-gray-600">
            인하대학교 산악부 부원들을 위한 볼더링 문제 공유 공간입니다.
          </p>

          <div className="mt-8 space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-bold text-gray-900">서비스 소개</h2>
              <p className="mt-2 leading-7">
                이 공간은 인하대학교 산악부 부원들을 위한 볼더링 문제 공유
                공간입니다. 암벽장에 세팅된 문제를 난이도별로 확인하고,
                댓글을 통해 피드백과 의견을 나눌 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">
                볼더링 등급 안내
              </h2>
              <p className="mt-2 leading-7">
                이 문제집은 볼더링 V등급 체계를 기준으로 구성되어 있습니다.
                일반적으로 V0에 가까울수록 쉬운 문제이고, 숫자가 올라갈수록
                난이도가 높아집니다. 다만 체감 난이도는 사람마다 다를 수 있으니,
                댓글을 통해 자유롭게 의견을 남겨 주세요.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900">요청 및 문의</h2>
              <p className="mt-2 leading-7">
                문제 등록 요청, 오류 제보, 수정 요청, 기타 문의사항은{" "}
                <span className="font-semibold">김연태</span>에게 전달해 주세요.
              </p>
            </section>
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-white p-8 shadow">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            난이도별 문제 보기
          </h2>

          <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {grades.map((grade) => (
              <Link
                key={grade}
                href={`/grades/${grade}`}
                className="rounded-xl bg-gray-50 px-4 py-6 text-center text-lg font-semibold shadow hover:bg-gray-100"
              >
                {grade}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}