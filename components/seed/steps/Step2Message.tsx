"use client";

const MAX_LENGTH = 50;

type Props = {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
};

export function Step2Message({ value, onChange, onNext, onBack }: Props) {
  return (
    <div className="space-y-10">
      <p className="text-center text-lg text-gray-800">
        전하고 싶은 말이 있나요?
      </p>

      <div className="space-y-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_LENGTH))}
          placeholder="너에게 꼭 전하고 싶었던 말은…"
          maxLength={MAX_LENGTH}
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-pink-200 focus:bg-white border border-transparent"
        />
        <p className="text-right text-xs text-gray-400">{value.length}/{MAX_LENGTH}</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 text-gray-500 hover:text-gray-700 text-sm"
        >
          이전
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-3 text-pink-600 hover:text-pink-700 text-sm font-medium"
        >
          다음
        </button>
      </div>
    </div>
  );
}
