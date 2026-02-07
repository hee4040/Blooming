"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BloomColor } from "@/components/bloom/Step1Color";
import type { BloomFeeling } from "@/lib/bloom-types";
import { setBloom } from "@/lib/bloom-store";

const COLOR_MAP: Record<BloomColor, string> = {
  pink: "#F8B4C4",
  peach: "#FFDAB9",
  lavender: "#E6E6FA",
  mint: "#B5EAD7",
  cream: "#FFF8E7",
  coral: "#F08080",
};

const FEELING_OPTIONS: { id: BloomFeeling; emoji: string; label: string }[] = [
  { id: "happy", emoji: "😊", label: "행복" },
  { id: "calm", emoji: "😌", label: "평온" },
  { id: "excited", emoji: "💗", label: "설렘" },
  { id: "supportive", emoji: "🌱", label: "응원" },
];

type Props = {
  seedId: string;
  colors: BloomColor[];
  message: string;
};

export function Step3Feeling({ seedId, colors, message }: Props) {
  const color = colors[0];
  const router = useRouter();
  const [selected, setSelected] = useState<BloomFeeling | null>(null);
  const [fading, setFading] = useState(false);

  const handleSelect = (feeling: BloomFeeling) => {
    if (selected) return;
    setSelected(feeling);
    setBloom(seedId, { colors, message, feeling });
    setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        router.push(`/result/${seedId}`);
      }, 400);
    }, 1000);
  };

  return (
    <div
      className={`space-y-8 transition-opacity duration-400 ${fading ? "opacity-0" : "opacity-100"}`}
    >
      <div className="flex justify-center">
        <div
          className="rounded-full transition-all duration-700 ease-out"
          style={{
            width: 72,
            height: 72,
            backgroundColor: COLOR_MAP[color] ?? "#F8B4C4",
            opacity: selected ? 1 : 0.85,
            transform: selected ? "scale(1.4)" : "scale(1)",
            boxShadow: selected
              ? `0 0 24px ${COLOR_MAP[color] ?? "#F8B4C4"}cc`
              : "0 0 8px rgba(0,0,0,0.06)",
          }}
        />
      </div>

      <p className="text-center text-lg text-gray-800">
        지금 이 꽃의 기분은 어떤가요?
      </p>

      <div className="flex flex-col gap-3">
        {FEELING_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSelect(option.id)}
            disabled={!!selected}
            className={`
              w-full py-4 px-5 rounded-xl text-left text-base
              transition-all duration-200
              flex items-center gap-3
              ${
                selected === option.id
                  ? "bg-pink-100 text-pink-900"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }
              ${selected && selected !== option.id ? "opacity-50" : ""}
            `}
          >
            <span className="text-xl">{option.emoji}</span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
