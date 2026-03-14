"use client";

import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { createProblem } from "./actions";

export default function UploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const hiddenFileRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState("");
  const [fileInfo, setFileInfo] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const originalFile = e.target.files?.[0];
    if (!originalFile) return;

    setError("");
    setFileInfo("");

    try {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(originalFile.type)) {
        setError("jpg, png, webp 파일만 업로드할 수 있습니다.");
        e.target.value = "";
        return;
      }

      setIsCompressing(true);

      const compressedFile = await imageCompression(originalFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        initialQuality: 0.8,
      });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(
        new File([compressedFile], originalFile.name, {
          type: compressedFile.type || originalFile.type,
          lastModified: Date.now(),
        })
      );

      if (hiddenFileRef.current) {
        hiddenFileRef.current.files = dataTransfer.files;
      }

      setFileInfo(
        `원본 ${(originalFile.size / 1024 / 1024).toFixed(2)}MB → 압축 후 ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
      );
    } catch (err) {
      console.error(err);
      setError("이미지 압축 중 오류가 발생했습니다.");
      e.target.value = "";
    } finally {
      setIsCompressing(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setError("");

    const compressedFile = hiddenFileRef.current?.files?.[0];
    if (!compressedFile) {
      setError("문제 사진을 선택해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createProblem(formData);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "업로드 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="mt-8 space-y-6"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          문제 제목
        </label>
        <input
          type="text"
          name="title"
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          난이도
        </label>
        <select
          name="grade"
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
          defaultValue="V0"
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
          required
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
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          문제 사진
        </label>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
        />

        {/* 실제 제출용 압축 파일 */}
        <input
          ref={hiddenFileRef}
          type="file"
          name="imageFile"
          className="hidden"
        />

        {isCompressing && (
          <p className="mt-2 text-sm text-blue-600">이미지를 압축하는 중입니다...</p>
        )}

        {fileInfo && (
          <p className="mt-2 text-sm text-gray-600">{fileInfo}</p>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || isCompressing}
        className="w-full rounded-xl bg-gray-900 px-4 py-3 text-white disabled:opacity-50"
      >
        {isSubmitting ? "업로드 중..." : "문제 등록"}
      </button>
    </form>
  );
}