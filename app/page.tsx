import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-md text-center space-y-8">
        <h1 className="text-2xl font-medium">
          당신의 마음으로, 한 송이 꽃을 심어보세요
        </h1>
        <p className="text-gray-600">
          두 사람의 마음이 모여야 완성됩니다
        </p>
        <Link
          href="/seed"
          className="inline-block px-6 py-3 bg-pink-100 text-pink-800 rounded-lg hover:bg-pink-200 transition-colors"
        >
          꽃의 씨앗 심기
        </Link>
      </div>
    </main>
  );
}
