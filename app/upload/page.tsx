import UploadForm from "./UploadForm";

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-gray-900">문제 업로드</h1>
        <p className="mt-2 text-gray-600">
          출제자가 새로운 볼더링 문제를 등록하는 페이지입니다.
        </p>

        <UploadForm />
      </div>
    </main>
  );
}