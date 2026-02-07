# 자연스럽게 자라는 꽃 생성기

L-system/재귀 기반으로 `줄기 → 가지 → 꽃` 구조를 생성하는 Python 모듈입니다.

## 설치

표준 라이브러리만 사용하므로 별도 패키지 설치 없이 실행 가능합니다.

```bash
python3 flower_generator.py --output flower.svg
```

## 주요 파라미터

| 파라미터 | 타입 | 설명 | 기본값 |
|----------|------|------|--------|
| `seed` | int \| str | 전체 구조 결정. 같은 seed → 항상 같은 꽃 | - |
| `bloom` | float (0~1) | 꽃 개수·가지 수·성장 정도 | 0.6 |
| `message_length` | int | 메시지 길이 (flower_type·밀도에 영향) | 0 |
| `petal_count` | int | 꽃잎 개수 | 5 |
| `flower_color` | str \| None | 꽃 색상. None이면 seed 기반 자동 | None |
| `background_color` | str \| None | 배경색. None이면 자동 | None |

- **flower_type** (자동): `single` / `cluster` / `bouquet` (bloom + message_length 기반)
- **색상 팔레트**: seed 기반 결정적 선택 (pink, peach, lavender, mint, cream, coral)

## 사용 예시

### CLI

```bash
# SVG 저장
python3 flower_generator.py --seed my-seed --bloom 0.8 --output out.svg

# SVG + growth animation용 data-delay/data-duration
python3 flower_generator.py --seed test --bloom 0.6 --animate --output out.svg

# JSON 출력 (React 연동용)
python3 flower_generator.py --seed 123 --bloom 0.5 --json

# 메시지 길이로 flower_type/밀도 자동 조절
python3 flower_generator.py --seed xyz --bloom 0.7 --message "Happy Birthday!" --json
```

### Python 코드

```python
from flower_generator import FlowerParams, generate_flower, to_svg

params = FlowerParams(
    seed="user-abc123",
    bloom=0.7,
    petal_count=5,
    flower_color="#E6E6FA",
    background_color="#fefaf8",
)

data = generate_flower(params)
svg_string = to_svg(data)
```

## 생성 구조 (파이프라인)

1. **줄기 생성** – 베이스 좌표에서 상단까지 직선/곡선
2. **가지 분기** – 재귀적으로 1~2개 하위 가지 생성 (L-system 스타일)
3. **꽃 위치 계산** – 가지 끝(tip) 중 bloom에 따라 선택
4. **꽃잎 배치** – 5~6개 부드러운 곡선 꽃잎, 중심 원

## JSON 출력 구조 (React / Growth Animation)

- **레이어**: stem → branches → flowers 순으로 growth animation
- **delay (ms)**: 각 요소별 등장 시점 (stem 0 → branches 400~ → flowers 900~)
- **flower_type**: seed/bloom/message 기반 자동 결정

```json
{
  "params": { "flower_type": "cluster", "flower_color": "#F8B4C4", ... },
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
  }
}
```

React + Framer Motion 연동: `REACT_INTEGRATION.md` 참고.

## SVG 예시 구조

```xml
<svg viewBox="0 0 320 240">
  <rect width="100%" height="100%" fill="#fefaf8"/>
  <g id="layer-stem">
    <line x1="160" y1="220" x2="160" y2="100" stroke="#5a8f5a" stroke-width="2.5"/>
  </g>
  <g id="layer-branches">
    <path d="M 160 100 Q 165 60 180 55" stroke="#5c935c" stroke-width="1.5"/>
    ...
  </g>
  <g id="layer-flowers">
    <path d="M ... Q ... Q ..." fill="#F8B4C4"/>
    <circle cx="180" cy="55" r="4" fill="#F8B4C4"/>
    ...
  </g>
</svg>
```

- `layer-stem`: 메인 줄기
- `layer-branches`: 가지 (베지어 곡선)
- `layer-flowers`: 꽃잎 + 중심
