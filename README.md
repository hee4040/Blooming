# 🌸 Blooming You

> _두 사람의 마음으로 피어나는 꽃_

한 사람이 씨앗(마음)을 심고, 다른 사람이 응답함으로써 하나의 꽃이 완성되는 **이벤트형 감성 웹 서비스**입니다.

---

## ✨ 핵심 컨셉

> 꽃은 혼자서는 피지 않는다.  
> 두 사람의 마음이 모여야 완성된다.

- **첫 번째 사용자 (보내는 사람)**: 꽃의 **의미(Seed)**를 만든다
- **두 번째 사용자 (받는 사람)**: 꽃의 **모습(Bloom)**을 완성한다
- **결과물**: 하나의 디지털 기념 꽃 — 씨앗 → 줄기 → 가지 → 꽃이 하나씩 피어나는 감정 경험

---

## 🛠️ 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS |
| Flower Engine | Python 3 (표준 라이브러리) |

---

## 📂 프로젝트 구조

```
blooming/
├── app/                    # Next.js App Router
│   ├── page.tsx            # 랜딩
│   ├── seed/               # 씨앗 심기 (보내는 사람)
│   ├── bloom/[seedId]/     # 꽃 완성 (받는 사람)
│   ├── result/[seedId]/    # 꽃 결과 (성장 애니메이션)
│   └── api/flower/         # Python 꽃 생성 API
├── components/
│   ├── seed/               # Step1DayType, Step2Message, Step3Mood, SeedShareLink
│   ├── bloom/              # Step1Color, Step2Message, Step3Feeling
│   └── result/             # FlowerBloom, FlowerGrowthView
├── lib/                    # seed-db, bloom-db, flower-api, flower-params, supabase
├── python/
│   └── flower_generator.py # seed 기반 결정적 꽃 생성 엔진
└── docs/                   # FLOWER_GROWTH_STORY, FLOWER_PIPELINE
```

---

## 🚀 시작하기

### 사전 요구사항

- Node.js 18+
- Python 3.10+

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

### 빌드

```bash
npm run build
npm start
```

---

## 📱 사용자 흐름

### 1. 보내는 사람

1. **랜딩** → “꽃의 씨앗 심기” 클릭
2. **Seed 작성** (`/seed`)
   - 어떤 날인가요? (기념일, 생일, 응원의 날, 그냥 오늘)
   - 전하고 싶은 말 (최대 50자)
   - 꽃의 분위기 (따뜻한, 설레는, 차분한, 응원하는)
3. **공유 링크** 생성 및 복사

### 2. 받는 사람

1. 공유 링크로 **Bloom 페이지** 접속 (`/bloom/[seedId]`)
2. **Bloom 작성**
   - 꽃 색상 선택 (2개 이상)
   - 메시지 입력
   - 지금 기분 선택 (행복, 평온, 설렘, 응원)
3. 선택 완료 시 **결과 페이지**로 이동 (`/result/[seedId]`)

### 3. 결과

- 씨앗 → 줄기 → 가지 → 꽃이 순차적으로 피어나는 애니메이션
- “이 꽃은 두 사람의 마음으로 피어났어요.” 문구 등장

---

## 🌿 꽃 생성 엔진

Python `flower_generator.py`는 **seed 기반 결정적**으로 꽃을 생성합니다.

- **seed**: 전체 가지 분기, 꽃 위치, 색상 팔레트 결정
- **bloom** (0~1): 꽃 밀도, 크기, 가지 길이
- **message_length**: 꽃 개수에 간접 영향

### CLI 예시

```bash
# JSON 출력 (React 연동용)
python3 python/flower_generator.py --seed test --bloom 0.6 --flowers 5 --message "hello" --json

# SVG 저장
python3 python/flower_generator.py --seed my-seed --bloom 0.8 --output out.svg
```

### API

```
GET /api/flower?seed=xxx&bloom=0.6&flowers=5&message=...&colors=#hex1,#hex2
```

- `timeline`: 씨앗·줄기·가지·꽃·문구 등장 시점 (ms)
- `meta`: seed_reason, bloom_reason, message_influence 설명
- `layers`: stem, branches, flowers SVG 좌표 데이터

자세한 내용은 `python/README.md`를 참고하세요.

---

## 📄 문서

- [prd.md](./prd.md) — 프로젝트 요구사항 정의
- [docs/FLOWER_GROWTH_STORY.md](./docs/FLOWER_GROWTH_STORY.md) — 꽃 성장 스토리 설계
- [docs/FLOWER_PIPELINE.md](./docs/FLOWER_PIPELINE.md) — 꽃 생성 파이프라인

---

## 🔜 확장 가능 구조

- **저장/공유 이미지**: `html2canvas` 등으로 `FlowerGrowthView` 캡처
- **기념일 seed**: seed에 `createdAt` 등 날짜 고정
- **Replay**: 꽃 성장 애니메이션 다시 보기
