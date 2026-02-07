"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

type Props = {
  seedId: string;
};

function generateShareUrl(seedId: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/bloom/${seedId}`;
}

export function SeedShareLink({ seedId }: Props) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(generateShareUrl(seedId));
  }, [seedId]);

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl text-gray-800">
          이 꽃은 아직 피지 않았어요.
        </h2>
        <p className="text-sm text-gray-600">
          아래 링크를 전해 이 꽃을 완성해 줄 사람에게 보내주세요.
        </p>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={url}
          readOnly
          className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-700 text-sm border border-gray-200"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="w-full py-3 rounded-xl bg-pink-100 text-pink-900 text-sm font-medium hover:bg-pink-200 transition-colors"
        >
          {copied ? "복사됐어요" : "복사하기"}
        </button>
      </div>

      <Link
        href={`/bloom/${seedId}`}
        className="block w-full py-3 text-center text-gray-500 hover:text-gray-700 text-sm"
      >
        이 링크로 이동해보기
      </Link>
    </div>
  );
}
