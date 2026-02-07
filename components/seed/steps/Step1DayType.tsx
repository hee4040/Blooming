"use client";

const DAY_OPTIONS = [
  { id: "anniversary", label: "기념일" },
  { id: "birthday", label: "생일" },
  { id: "cheer", label: "응원의 날" },
  { id: "today", label: "그냥 오늘" },
] as const;

export type DayType = (typeof DAY_OPTIONS)[number]["id"];

type Props = {
  value: DayType | null;
  onChange: (value: DayType) => void;
  onNext: () => void;
};

export function Step1DayType({ value, onChange, onNext }: Props) {
  return (
    <div className="space-y-10">
      <p className="text-center text-lg text-gray-800">
        오늘은 어떤 날인가요?
      </p>

      <div className="flex flex-col gap-3">
        {DAY_OPTIONS.map((option) => (
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

      {value && (
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
