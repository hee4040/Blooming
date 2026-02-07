# 꽃 생성기 적용 파이프라인 제안

## 선택: 서버 기반 (1번) 추천

### 선택 이유

| 방식 | 장점 | 단점 |
|------|------|------|
| **1. 서버 기반** | 동적 Seed/Bloom 즉시 반영, 모든 조합 지원, 개발 중 실시간 테스트 | 서버에 Python 필요 |
| 2. 빌드 타임 | 정적 호스팅 가능, 서버 부하 없음 | Seed/Bloom 조합을 미리 정해야 함, 동적 생성 불가 |

- Seed/Bloom은 사용자가 만들어 나가는 값이라 **미리 정해둘 수 없음** → 서버 기반이 필수
- 개발 시 `npm run dev` + API 호출로 바로 확인 가능

---

## 파일 구조

```
blooming/
├── app/
│   ├── api/
│   │   └── flower/
│   │       └── route.ts          # 새로 추가: Python 호출 API
│   └── result/[seedId]/page.tsx
├── lib/
│   ├── flower-api.ts             # 새로 추가: API 호출 유틸
│   └── ...
├── python/
│   └── flower_generator.py       # 기존 유지
└── docs/
    └── FLOWER_PIPELINE.md
```

---

## 데이터 흐름

```
[Client] Seed + Bloom 데이터
    → fetch /api/flower?seed=xxx&bloom=0.6&message=...
    → [API Route] child_process.spawn(python3 flower_generator.py --json ...)
    → [Python] JSON stdout
    → [API] JSON 응답
    → [React] 렌더링 (Framer Motion 등)
```

---

## 개발 환경 요구사항

- 로컬에 **Python 3** 설치
- `python3 flower_generator.py --json` 실행 가능해야 함

---

## 최소 코드 예시

### 1. API Route (`app/api/flower/route.ts`)

```ts
// GET /api/flower?seed=xxx&bloom=0.6&message=...
// → spawn("python3", ["python/flower_generator.py", "--seed", seed, "--bloom", bloom, "--json"])
// → stdout를 JSON으로 파싱하여 응답
```

### 2. React에서 사용

```tsx
"use client";

import { useEffect, useState } from "react";
import { fetchFlowerData, type FlowerData } from "@/lib/flower-api";

export function FlowerFromApi({ seedId, bloom, message }: Props) {
  const [data, setData] = useState<FlowerData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFlowerData({
      seed: seedId,
      bloom: bloom,  // 0~1
      message,
    })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [seedId, bloom, message]);

  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <svg viewBox={data.viewBox}>
      <rect width="100%" height="100%" fill={data.params.background_color} />
      {/* data.layers.stem, branches, flowers 렌더링 */}
    </svg>
  );
}
```

### 3. Seed/Bloom → API 파라미터 매핑

```ts
// lib/flower-params 또는 컴포넌트 내부
const bloomValue = 0.3 + (bloom.message.length / 30) * 0.5;  // 0.3~0.8
const apiParams = {
  seed: seedId,
  bloom: Math.min(1, bloomValue),
  message: bloom.message,
};
```

---

## 개발 단계 테스트

```bash
# 1. Next.js 개발 서버 실행
npm run dev

# 2. 브라우저 또는 curl로 API 테스트
curl "http://localhost:3000/api/flower?seed=test&bloom=0.6&message=hello"

# 3. JSON 응답 확인 후 React에서 fetchFlowerData() 호출
```

---

## 배포 시 참고

- **Vercel**: Node.js 함수에서 Python subprocess는 기본 미지원.  
  - 옵션 A: `api/flower.py`를 Vercel Python 런타임으로 분리  
  - 옵션 B: Docker/Railway 등 Python 실행 가능 환경에 배포
- **Docker / VPS**: Python 설치 후 그대로 사용 가능
