"use client";

import type { BloomColor } from "@/components/bloom/Step1Color";

const COLOR_MAP: Record<BloomColor, string> = {
  pink: "#F8B4C4",
  peach: "#FFDAB9",
  lavender: "#E6E6FA",
  mint: "#B5EAD7",
  cream: "#FFF8E7",
  coral: "#F08080",
};

const MAX_LENGTH = 20;

type Props = {
  color: BloomColor;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
};

export function Step2Message({ color, value, onChange, onNext }: Props) {
  const len = value.length;
  const intensity = len / MAX_LENGTH;

  const scale = 1 + intensity * 0.15;
  const opacity = 0.7 + intensity * 0.3;
  const glowSize = 0 + intensity * 12;

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <div
          className="transition-all duration-300 ease-out rounded-full"
          style={{
            width: 64,
            height: 64,
            backgroundColor: COLOR_MAP[color] ?? "#F8B4C4",
            opacity,
            transform: `scale(${scale})`,
            boxShadow:
              glowSize > 0
                ? `0 0 ${glowSize}px ${COLOR_MAP[color] ?? "#F8B4C4"}80`
                : "none",
          }}
        />
      </div>

      <p className="text-center text-lg text-gray-800">
        이 꽃에게 한마디를 남겨줄래요?
      </p>

      <div className="space-y-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_LENGTH))}
          placeholder="한 단어여도 괜찮아요"
          maxLength={MAX_LENGTH}
          className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:bg-white border border-transparent text-center"
        />
        <p className="text-center text-xs text-gray-400">
          {len}/{MAX_LENGTH}
        </p>
      </div>

      {value.length > 0 && (
        <button
          type="button"
          onClick={onNext}
          className="w-full py-3 text-pink-600 hover:text-pink-700 text-sm font-medium"
        >
          다음
        </button>
      )}
    </div>
  );
}
