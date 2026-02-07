"use client";

type Props = {
  onShare: () => void;
  disabled?: boolean;
};

export function SeedCompleted({ onShare, disabled }: Props) {
  return (
    <div className="space-y-10 text-center">
      <p className="text-xl text-gray-800 step-transition">
        씨앗이 심어졌어요.
      </p>
      <button
        type="button"
        onClick={onShare}
        disabled={disabled}
        className="w-full py-4 px-5 rounded-xl bg-pink-100 text-pink-900 font-medium hover:bg-pink-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {disabled ? "저장 중..." : "이 꽃을 완성해 줄 사람에게 보내기"}
      </button>
    </div>
  );
}
