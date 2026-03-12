"use client";

export default function DeleteButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        const ok = window.confirm("정말 이 문제를 삭제할까요?");
        if (!ok) {
          e.preventDefault();
        }
      }}
      className="rounded-xl bg-red-600 px-5 py-3 text-white hover:bg-red-700"
    >
      문제 삭제
    </button>
  );
}