"use client";

const MOOD_OPTIONS = [
  { id: "warm", label: "따뜻한" },
  { id: "exciting", label: "설레는" },
  { id: "calm", label: "차분한" },
  { id: "supportive", label: "응원하는" },
] as const;

export type Mood = (typeof MOOD_OPTIONS)[number]["id"];

type Props = {
  value: Mood | null;
  onChange: (value: Mood) => void;
  onNext: () => void;
  onBack: () => void;
};

export function Step3Mood({ value, onChange, onNext, onBack }: Props) {
  return (
    <div className="space-y-10">
      <p className="text-center text-lg text-gray-800">
        이 꽃은 어떤 분위기였으면 좋을까요?
      </p>

      <div className="flex flex-col gap-3">
        {MOOD_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`
              w-full py-4 px-5 rounded-xl text-left text-base
              transition-colors duration-200
              ${
                value === option.id
                  ? "bg-pink-100 text-pink-900"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 text-gray-500 hover:text-gray-700 text-sm"
        >
          이전
        </button>
        {value && (
          <button
            type="button"
            onClick={onNext}
            className="flex-1 py-3 text-pink-600 hover:text-pink-700 text-sm font-medium"
          >
            다음
          </button>
        )}
      </div>
    </div>
  );
}
