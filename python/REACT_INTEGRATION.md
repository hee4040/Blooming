# React + Framer Motion 연동 가이드

## JSON 출력 구조 (Growth Animation 지원)

```json
{
  "params": {
    "seed": "...",
    "bloom": 0.6,
    "flower_type": "cluster",
    "flower_color": "#F8B4C4",
    "background_color": "#fff5f5"
  },
  "animation": {
    "stem_duration": 600,
    "branch_duration": 500,
    "flower_duration": 400,
    "stagger": { "branch": 50, "flower": 70 }
  },
  "layers": {
    "stem": { "segments": [{ "id": "stem-0", "x1", "y1", "x2", "y2", "delay": 0 }] },
    "branches": { "segments": [{ "id": "branch-0", "path", "depth", "delay": 400 }] },
    "flowers": [{ "id": "flower-0", "cx", "cy", "delay": 900, ... }]
  },
  "viewBox": "0 0 320 240"
}
```

- **delay (ms)**: stem 0 → branches 400~ → flowers 900~
- **flower_type**: `single` | `cluster` | `bouquet` (seed/bloom/message 기반)

---

## Framer Motion 활용 예시

### 1. 레이어별 순차 등장

```tsx
import { motion } from "framer-motion";

const stemVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (delay: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { delay: delay / 1000, duration: 0.6 },
  }),
};

// stem
<motion.line
  custom={seg.delay}
  variants={stemVariants}
  initial="hidden"
  animate="visible"
  x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
  stroke="#5a8f5a"
/>
```

### 2. pathLength로 가지 그리기

```tsx
<motion.path
  d={seg.path}
  fill="none"
  stroke="#5c935c"
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
  transition={{
    delay: seg.delay / 1000,
    duration: 0.5,
    ease: "easeInOut",
  }}
/>
```

### 3. 꽃 scale + opacity

```tsx
<motion.g
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{
    delay: flower.delay / 1000,
    duration: 0.4,
    type: "spring",
    stiffness: 200,
  }}
>
  {/* petals, center */}
</motion.g>
```

### 4. 공통 wrapper

```tsx
function FlowerBloom({ data }: { data: FlowerData }) {
  const { layers, animation } = data;
  return (
    <svg viewBox={data.viewBox} className="w-full h-auto">
      <rect width="100%" height="100%" fill={data.params.background_color} />
      <g id="layer-stem">
        {layers.stem.segments.map((seg) => (
          <StemLine key={seg.id} segment={seg} duration={animation.stem_duration} />
        ))}
      </g>
      <g id="layer-branches">
        {layers.branches.segments.map((seg) => (
          <BranchPath key={seg.id} segment={seg} duration={animation.branch_duration} />
        ))}
      </g>
      <g id="layer-flowers">
        {layers.flowers.map((f) => (
          <Flower key={f.id} flower={f} duration={animation.flower_duration} />
        ))}
      </g>
    </svg>
  );
}
```

---

## 타입 정의 (TypeScript)

```ts
interface FlowerData {
  params: {
    seed: string;
    bloom: number;
    flower_type: "single" | "cluster" | "bouquet";
    flower_color: string;
    background_color: string;
  };
  animation: {
    stem_duration: number;
    branch_duration: number;
    flower_duration: number;
    stagger: { branch: number; flower: number };
  };
  layers: {
    stem: { segments: Array<{ id: string; x1: number; y1: number; x2: number; y2: number; delay: number }> };
    branches: { segments: Array<{ id: string; path: string; depth: number; delay: number }> };
    flowers: Array<{
      id: string;
      cx: number;
      cy: number;
      petal_count: number;
      petal_length: number;
      petal_width: number;
      center_radius: number;
      rotation: number;
      scale: number;
      delay: number;
    }>;
  };
  viewBox: string;
}
```

---

## API 호출 예시

Python 백엔드에서 JSON 반환 시:

```ts
const res = await fetch(`/api/flower?seed=${seedId}&bloom=${bloom}&message=${encodeURIComponent(message)}`);
const flowerData: FlowerData = await res.json();
```
