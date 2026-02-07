"use client";

type Props = {
  onShare: () => void;
};

export function SeedCompleted({ onShare }: Props) {
  return (
    <div className="space-y-10 text-center">
      <p className="text-xl text-gray-800 step-transition">
        씨앗이 심어졌어요.
      </p>
      <button
        type="button"
        onClick={onShare}
        className="w-full py-4 px-5 rounded-xl bg-pink-100 text-pink-900 font-medium hover:bg-pink-200 transition-colors"
      >
        이 꽃을 완성해 줄 사람에게 보내기
      </button>
    </div>
  );
}
