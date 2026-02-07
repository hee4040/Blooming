# 꽃 성장 스토리 — 감정 경험 설계

꽃을 한 번에 보여주지 않고, **감정 흐름**이 느껴지도록 단계별로 등장시키는 설계 문서입니다.

---

## 1. 성장 스토리 타임라인

| 단계 | 요소 | 시작(ms) | 의미 |
|------|------|----------|------|
| 1) 씨앗 | 작은 원 | 0 | 시작점, 잠재력 |
| 2) 줄기 | (현재 구조에서는 시드와 동일) | 0 | - |
| 3) 가지 | 분기선 | 500 + stagger | 성장, 확장 |
| 4) 꽃 | 꽃잎 하나씩 | branches_end + 400 + stagger | 피어남 |
| 5) 문구 | "이 꽃은 두 사람의 마음으로..." | flowers_end + 300 | 완성, 메시지 |

- **Python JSON**: `timeline` 객체에 각 단계의 `start`, `duration`, `stagger` 포함
- **React/CSS**: `animation`, `animationDelay`로 시각적 연출 제어

---

## 2. Seed → Bloom → Flower 연결

### meta 필드 (JSON)

```json
"meta": {
  "seed_reason": "seed로 전체 가지 분기 구조, 꽃 위치, 색상 팔레트가 결정적으로 생성됨",
  "bloom_reason": "bloom(0~1)로 가지 밀도, 꽃 크기, 초기 가지 길이가 변함",
  "message_influence": "message_length로 꽃 개수(flower_count)에 간접 영향"
}
```

### 입력 영향 정리

| 입력 | 영향 |
|------|------|
| **seed** | 고유 구조(가지 개수·각도·위치), 색상 팔레트 |
| **bloom** | 꽃 밀도, 크기(size_factor), 가지 길이 |
| **message_length** | flower_count (seed.message 3글자당 +1꽃) |

---

## 3. React 컴포넌트 구조

```
FlowerGrowthView
├── FlowerStageSeed      (1) 씨앗
├── FlowerStageStem      (2) 줄기
├── FlowerStageBranches  (3) 가지
└── FlowerStageFlowers   (4) 꽃 하나씩
```

- `FlowerBloom`: 메시지 표시 + `FlowerGrowthView` 렌더링
- 메시지: `messageText` prop으로 교체 가능

---

## 4. 확장 가능 구조

- **저장/공유 이미지**: `FlowerGrowthView`를 `ref` + `html2canvas` 등으로 캡처
- **기념일 seed**: seed에 `createdAt` 등 날짜 포함 가능
- **Replay**: `FlowerGrowthView`에 `replay()` 또는 `currentStage` prop으로 단계 재생

---

## 5. JSON 구조 예시

```json
{
  "params": { "seed": "...", "bloom": 0.6, ... },
  "timeline": {
    "seed": { "start": 0, "duration": 600 },
    "branches": { "start": 500, "stagger": 80 },
    "flowers": { "start": 1500, "stagger": 120 },
    "message": { "start": 3500 }
  },
  "meta": { ... },
  "layers": { "stem": {...}, "branches": {...}, "flowers": {...} }
}
```
