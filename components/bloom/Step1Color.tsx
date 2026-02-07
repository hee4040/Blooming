"use client";

const COLOR_OPTIONS = [
  { id: "pink", label: "연한 핑크", hex: "#F8B4C4" },
  { id: "peach", label: "복숭아", hex: "#FFDAB9" },
  { id: "lavender", label: "라벤더", hex: "#E6E6FA" },
  { id: "mint", label: "민트", hex: "#B5EAD7" },
  { id: "cream", label: "크림", hex: "#FFF8E7" },
  { id: "coral", label: "코랄", hex: "#F08080" },
] as const;

export type BloomColor = (typeof COLOR_OPTIONS)[number]["id"];

type Props = {
  value: BloomColor[];
  onChange: (value: BloomColor[]) => void;
  onNext: () => void;
};

export function Step1Color({ value, onChange, onNext }: Props) {
  const toggle = (id: BloomColor) => {
    if (value.includes(id)) {
      onChange(value.filter((c) => c !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <span className="text-5xl" aria-hidden>🌱</span>
      </div>

      <div className="text-center space-y-2">
        <p className="text-lg text-gray-800">이 꽃은 아직 피지 않았어요.</p>
        <p className="text-gray-600">당신의 손길로 이 꽃을 완성해 주세요.</p>
      </div>

      <p className="text-center text-gray-800">
        꽃에 어떤 색을 입혀주고 싶나요? (2개 이상 선택)
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        {COLOR_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => toggle(option.id)}
            className={`
              w-14 h-14 rounded-full border-2 transition-all duration-200
              hover:scale-110
              ${value.includes(option.id) ? "border-pink-400 scale-110 ring-2 ring-pink-200" : "border-gray-200"}
            `}
            style={{ backgroundColor: option.hex }}
            title={option.label}
          />
        ))}
      </div>
      <p className="text-center text-xs text-gray-400">
        {value.length >= 2
          ? `${value.length}개 선택됨`
          : "2개 이상 선택해 주세요"}
      </p>

      {value.length >= 2 && (
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
