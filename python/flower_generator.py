"""
자연스럽게 자라는 꽃 생성기

L-system 기반으로 줄기 → 가지 → 꽃 구조를 생성하며,
seed에 따라 결정적으로 같은 결과를 만듭니다.

출력: SVG 파일 또는 React용 JSON 좌표 데이터
"""

import json
import math
from dataclasses import dataclass, field
from typing import Any


# =============================================================================
# 1. 파라미터 및 유틸리티
# =============================================================================

# 꽃 형태: 한 송이 / 여러 송이(클러스터) / 부케
FLOWER_TYPES = ("single", "cluster", "bouquet")

# seed 기반 색상 팔레트
COLOR_PALETTES: list[dict[str, str]] = [
    {"flower": "#F8B4C4", "background": "#fff5f5"},   # pink
    {"flower": "#FFDAB9", "background": "#fffef5"},   # peach
    {"flower": "#E6E6FA", "background": "#f5f5ff"},   # lavender
    {"flower": "#B5EAD7", "background": "#f0faf7"},   # mint
    {"flower": "#FFF8E7", "background": "#fffef5"},   # cream
    {"flower": "#F08080", "background": "#fff0f0"},   # coral
]


@dataclass
class FlowerParams:
    """꽃 생성에 필요한 모든 파라미터"""
    seed: int | str
    bloom: float  # 0~1, 꽃 크기·가지 밀도·색감/스타일
    flower_count: int = 5  # 생성할 꽃 개수 (기본 5개, 입력에 따라 조정)
    petal_count: int = 5
    flower_colors: list[str] | None = None  # 여러 색 → 꽃마다 다르게. None이면 단색 자동
    flower_color: str | None = None   # 단색용 (호환)
    background_color: str | None = None
    message_length: int = 0


def _hash_seed(seed: int | str) -> int:
    """seed를 정수로 변환"""
    if isinstance(seed, int):
        return seed
    h = 0
    for c in str(seed):
        h = (h * 31 + ord(c)) & 0xFFFFFFFF
    return h


def _random(rng_state: list[int], min_val: float, max_val: float) -> float:
    """결정적 의사난수 (같은 seed → 같은 시퀀스)"""
    s = rng_state[0]
    s = (s * 1103515245 + 12345) & 0x7FFFFFFF
    rng_state[0] = s
    t = s / 0x7FFFFFFF
    return min_val + t * (max_val - min_val)


def _derive_flower_style(
    seed_int: int,
    bloom: float,
    message_length: int,
) -> tuple[str, str, str]:
    """
    seed / bloom / message_length → flower_type, flower_color, background_color
    """
    # flower_type: single / cluster / bouquet
    intensity = bloom * 0.6 + min(1.0, message_length / 30) * 0.4
    if intensity < 0.35:
        flower_type = "single"
    elif intensity < 0.65:
        flower_type = "cluster"
    else:
        flower_type = "bouquet"

    # palette: seed 기반 결정적 선택
    palette_idx = (seed_int % len(COLOR_PALETTES) + len(COLOR_PALETTES)) % len(COLOR_PALETTES)
    palette = COLOR_PALETTES[palette_idx]

    return flower_type, palette["flower"], palette["background"]


# =============================================================================
# 2. 줄기 생성
# =============================================================================

@dataclass
class StemSegment:
    x1: float
    y1: float
    x2: float
    y2: float
    layer: str = "stem"


def generate_stem(
    base_x: float,
    base_y: float,
    length: float,
    rng: list[int],
) -> StemSegment:
    """줄기 1개 생성 (살짝 굽은 곡선)"""
    bend = _random(rng, -3, 3)
    mid_x = base_x + bend
    mid_y = base_y - length * 0.5
    end_x = base_x + _random(rng, -2, 2)
    end_y = base_y - length
    return StemSegment(base_x, base_y, end_x, end_y)


# =============================================================================
# 3. 가지 생성 — 1~2개: 1:1 방식 / 3개 이상: 클러스터 방식
# =============================================================================

@dataclass
class BranchSegment:
    x1: float
    y1: float
    x2: float
    y2: float
    path_d: str  # SVG path
    depth: int
    layer: str = "branches"


@dataclass
class BranchTip:
    x: float
    y: float
    depth: int
    angle: float


def generate_flower_branches(
    start_x: float,
    start_y: float,
    flower_count: int,
    length: float,
    rng: list[int],
) -> tuple[list[BranchSegment], list[BranchTip]]:
    """
    1~2개 꽃: 가지 수 = 꽃 수, 각 가지 끝에 꽃 1개.
    """
    segments: list[BranchSegment] = []
    tips: list[BranchTip] = []

    if flower_count <= 0:
        return segments, tips

    if flower_count == 1:
        base_angles = [0]
    else:
        base_angles = [-55, 55]

    for i, base_angle in enumerate(base_angles[:flower_count]):
        wobble = _random(rng, -4, 4)
        angle = base_angle + wobble
        rad = math.radians(angle)

        end_x = start_x + length * math.sin(rad)
        end_y = start_y - length * math.cos(rad)

        ctrl_x = start_x + (end_x - start_x) * 0.4 + _random(rng, -3, 3)
        ctrl_y = start_y - length * 0.45 + _random(rng, -2, 2)
        path_d = f"M {start_x:.2f} {start_y:.2f} Q {ctrl_x:.2f} {ctrl_y:.2f} {end_x:.2f} {end_y:.2f}"

        segments.append(BranchSegment(start_x, start_y, end_x, end_y, path_d, 0))
        tips.append(BranchTip(end_x, end_y, 0, angle))

    return segments, tips


def generate_branches_cluster(
    start_x: float,
    start_y: float,
    bloom: float,
    rng: list[int],
) -> tuple[list[BranchSegment], list[BranchTip]]:
    """
    3개 이상 꽃: 재귀 분기로 클러스터형 가지 생성.
    """
    segments: list[BranchSegment] = []
    tips: list[BranchTip] = []
    max_depth = 3
    branch_factor = 0.8
    initial_length = 38 + bloom * 18

    def _recurse(sx: float, sy: float, angle: float, length: float, depth: int):
        if depth >= max_depth or length < 8:
            return
        rad = math.radians(angle)
        end_x = sx + length * math.sin(rad)
        end_y = sy - length * math.cos(rad)

        ctrl_x = sx + (end_x - sx) * 0.4 + _random(rng, -5, 5)
        ctrl_y = sy - length * 0.5 + _random(rng, -3, 3)
        path_d = f"M {sx:.2f} {sy:.2f} Q {ctrl_x:.2f} {ctrl_y:.2f} {end_x:.2f} {end_y:.2f}"

        segments.append(BranchSegment(sx, sy, end_x, end_y, path_d, depth))
        tips.append(BranchTip(end_x, end_y, depth, angle))

        if depth == 0:
            base_angles = [-60, 0, 60]
            wobble = 10
            child_angles = [a + _random(rng, -wobble, wobble) for a in base_angles]
            child_length = length * (_random(rng, 0.65, 0.8))
        else:
            n_children = 2 if _random(rng, 0, 1) < branch_factor else 1
            child_length = length * (_random(rng, 0.55, 0.75))
            spread = 38 + _random(rng, 0, 10)
            child_angles = [angle + spread * (1 if i == 0 else -1) * (0.7 + _random(rng, 0, 0.3))
                           for i in range(n_children)]

        for a in child_angles:
            _recurse(end_x, end_y, a, child_length, depth + 1)

    _recurse(start_x, start_y, 0, initial_length, 0)
    return segments, tips


def _dist(p1: tuple[float, float], p2: tuple[float, float]) -> float:
    return math.hypot(p1[0] - p2[0], p1[1] - p2[1])


def _min_dist_from_all(pos: tuple[float, float], positions: list[tuple[float, float, float, float]]) -> float:
    if not positions:
        return float("inf")
    return min(_dist(pos, (p[0], p[1])) for p in positions)


def _angle_from_center(cx: float, cy: float, px: float, py: float) -> float:
    return math.degrees(math.atan2(px - cx, cy - py)) % 360


def compute_flower_positions_cluster(
    tips: list[BranchTip],
    flower_count: int,
    rng: list[int],
    center_x: float = 160,
    center_y: float = 210,
    min_flower_dist: float = 16,
) -> list[tuple[float, float, float, float]]:
    """
    클러스터 모드: 꽃은 줄기 끝에 배치, 겹치지 않게, 색상별 골고루 퍼지도록.
    """
    if not tips or flower_count <= 0:
        return []

    sorted_by_y = sorted(tips, key=lambda t: (t.y, abs(t.x - center_x), _random(rng, 0, 0.1)))
    positions: list[tuple[float, float, float, float]] = []

    for tip in sorted_by_y:
        if len(positions) >= flower_count:
            break
        if _min_dist_from_all((tip.x, tip.y), positions) >= min_flower_dist:
            positions.append((tip.x, tip.y, tip.angle, 1.0))

    cluster_radius = 5
    attempts = 0
    while len(positions) < flower_count and attempts < flower_count * 3:
        attempts += 1
        tip = sorted_by_y[attempts % len(sorted_by_y)]
        for _ in range(5):
            theta = math.radians(tip.angle) + math.radians(_random(rng, -25, 25))
            ox = tip.x + cluster_radius * math.cos(theta)
            oy = tip.y - cluster_radius * math.sin(theta)
            if _min_dist_from_all((ox, oy), positions) >= min_flower_dist:
                positions.append((ox, oy, tip.angle, 0.9))
                break

    positions = positions[:flower_count]
    positions.sort(key=lambda p: _angle_from_center(center_x, center_y, p[0], p[1]))
    return positions


# =============================================================================
# 4. 꽃 위치 계산 및 꽃잎 배치
# =============================================================================

@dataclass
class FlowerData:
    cx: float
    cy: float
    petal_count: int
    petal_length: float
    petal_width: float
    center_radius: float
    rotation: float
    scale: float = 1.0
    color: str | None = None  # 꽃별 색상
    layer: str = "flowers"


def generate_petal_path(
    cx: float,
    cy: float,
    angle: float,
    petal_length: float,
    petal_width: float,
) -> str:
    """
    부드러운 곡선 형태의 꽃잎 1개 (SVG path).
    5~6개 꽃잎이 자연스럽게 퍼지도록.
    """
    rad = math.radians(angle)
    cos_a = math.cos(rad)
    sin_a = math.sin(rad)

    def rot(x: float, y: float) -> tuple[float, float]:
        rx = x * cos_a - y * sin_a
        ry = x * sin_a + y * cos_a
        return cx + rx, cy + ry

    # 타원 + 베지어로 부드러운 꽃잎
    w2 = petal_width / 2
    l = petal_length
    p0 = rot(0, 0)
    p1 = rot(-w2, -l * 0.3)
    p2 = rot(0, -l)
    p3 = rot(w2, -l * 0.3)
    c1 = rot(-w2 * 1.2, -l * 0.5)
    c2 = rot(w2 * 1.2, -l * 0.5)

    d = f"M {p0[0]:.2f} {p0[1]:.2f} Q {c1[0]:.2f} {c1[1]:.2f} {p2[0]:.2f} {p2[1]:.2f} Q {c2[0]:.2f} {c2[1]:.2f} {p0[0]:.2f} {p0[1]:.2f}"
    return d


def generate_flowers(
    positions: list[tuple[float, float, float, float]],
    petal_count: int,
    flower_colors: list[str],
    rng: list[int],
    size_factor: float = 1.0,
) -> list[FlowerData]:
    """각 위치에 꽃 데이터 생성. size_factor로 bloom 기반 꽃 크기 조절."""
    flowers: list[FlowerData] = []
    base_petal_length = (12 + _random(rng, 0, 4)) * size_factor
    base_petal_width = (4 + _random(rng, 0, 2)) * size_factor

    for i, (cx, cy, base_angle, scale) in enumerate(positions):
        rotation = _random(rng, -10, 10)
        color = flower_colors[i % len(flower_colors)] if flower_colors else None
        flowers.append(FlowerData(
            cx=cx, cy=cy,
            petal_count=petal_count,
            petal_length=base_petal_length * scale,
            petal_width=base_petal_width * scale,
            center_radius=(3 + _random(rng, 0, 1.5)) * scale * size_factor,
            rotation=rotation,
            scale=scale,
            color=color,
        ))

    return flowers


# =============================================================================
# 5. 메인 생성 파이프라인
# =============================================================================

def generate_flower(params: FlowerParams) -> dict[str, Any]:
    """
    전체 파이프라인: 줄기 → 가지 → 꽃 위치 → 꽃잎
    React 렌더링용 JSON 구조 반환 (delay ms 포함, growth animation 지원).
    """
    seed_int = _hash_seed(params.seed)
    rng = [seed_int]

    flower_type, auto_flower_color, auto_bg = _derive_flower_style(
        seed_int, params.bloom, params.message_length
    )
    single_color = params.flower_color or auto_flower_color
    flower_colors = params.flower_colors or [single_color]
    background_color = params.background_color or auto_bg

    # (1) 굵은 줄기 없음. 가지는 바닥(시드)에서 바로 시작.
    VIEW_HEIGHT = 240
    base_x, base_y = 160, 210
    branch_start_x, branch_start_y = base_x, base_y

    # (2) 1~2개: 가지=꽃 1:1 / 3개 이상: 클러스터 방식. 전체적으로 크게.
    if params.flower_count < 3:
        branch_length = 38 + params.bloom * 18
        segments, tips = generate_flower_branches(
            branch_start_x, branch_start_y,
            params.flower_count,
            branch_length,
            rng,
        )
        positions = [(t.x, t.y, t.angle, 1.0) for t in tips]
        positions.sort(key=lambda p: _angle_from_center(160, base_y, p[0], p[1]))
    else:
        segments, tips = generate_branches_cluster(
            branch_start_x, branch_start_y,
            params.bloom,
            rng,
        )
        positions = compute_flower_positions_cluster(
            tips, params.flower_count, rng,
            center_x=160, center_y=base_y, min_flower_dist=16,
        )

    # bloom → 꽃 크기
    size_factor = 0.85 + params.bloom * 0.3

    flowers = generate_flowers(
        positions,
        params.petal_count,
        flower_colors,
        rng,
        size_factor,
    )

    # 성장 스토리 타임라인 (ms): 1) 씨앗 2) 줄기 3) 가지 4) 꽃 5) 문구
    SEED_START = 0
    SEED_DURATION = 600
    BRANCH_START = 500
    BRANCH_STAGGER = 80
    FLOWER_START = BRANCH_START + len(segments) * BRANCH_STAGGER + 400
    FLOWER_STAGGER = 120
    MESSAGE_START = FLOWER_START + len(flowers) * FLOWER_STAGGER + 300

    # 꽃이 주인공: 스케일 2.0배, 전체적으로 크게
    scale = 2.0
    cx, cy = 160, 185

    def scale_pt(x: float, y: float) -> tuple[float, float]:
        return ((x - 160) * scale + 160, (y - cy) * scale + cy)

    # 줄기: 씨앗(바닥) → 위로 짧게 자람 (가지가 시작되기 전)
    stem_top_y = base_y - 18
    stem_bottom_x, stem_bottom_y = scale_pt(base_x, base_y)
    stem_top_x, stem_top_y_scaled = scale_pt(base_x, stem_top_y)
    stem_seg = {
        "id": "stem-0",
        "x1": stem_bottom_x, "y1": stem_bottom_y,
        "x2": stem_top_x, "y2": stem_top_y_scaled,
        "delay": SEED_START,
        "stage": "seed",
    }

    def scale_path(d: str) -> str:
        import re
        def repl(m: object) -> str:
            x, y = float(m.group(1)), float(m.group(2))
            sx, sy = scale_pt(x, y)
            return f"{sx:.2f} {sy:.2f}"
        return re.sub(r"([\d.-]+)\s+([\d.-]+)", repl, d)

    scaled_branches = []
    for i, s in enumerate(segments):
        scaled_branches.append({
            "id": f"branch-{i}",
            "path": scale_path(s.path_d),
            "depth": s.depth,
            "delay": BRANCH_START + i * BRANCH_STAGGER,
            "stage": "branches",
            "stroke_width": 1.9 if s.depth == 0 else (1.7 if s.depth == 1 else 1.5),
        })

    scaled_flowers = []
    for i, f in enumerate(flowers):
        fx, fy = scale_pt(f.cx, f.cy)
        scaled_flowers.append({
            "id": f"flower-{i}",
            "cx": fx, "cy": fy,
            "petal_count": f.petal_count,
            "petal_length": f.petal_length * 1.5,
            "petal_width": f.petal_width * 1.5,
            "center_radius": f.center_radius * 1.5,
            "rotation": f.rotation,
            "scale": f.scale,
            "color": f.color,
            "delay": FLOWER_START + i * FLOWER_STAGGER,
            "stage": "flowers",
        })

    return {
        "params": {
            "seed": str(params.seed),
            "bloom": params.bloom,
            "flower_type": flower_type,
            "petal_count": params.petal_count,
            "flower_color": single_color,
            "flower_colors": flower_colors,
            "background_color": background_color,
        },
        "animation": {
            "seed_duration": SEED_DURATION,
            "stem_duration": SEED_DURATION,
            "branch_duration": 500,
            "flower_duration": 400,
            "stagger": {"branch": BRANCH_STAGGER, "flower": FLOWER_STAGGER},
        },
        "timeline": {
            "seed": {"start": SEED_START, "duration": SEED_DURATION},
            "branches": {"start": BRANCH_START, "stagger": BRANCH_STAGGER},
            "flowers": {"start": FLOWER_START, "stagger": FLOWER_STAGGER},
            "message": {"start": MESSAGE_START},
        },
        "meta": {
            "seed_reason": "seed로 전체 가지 분기 구조, 꽃 위치, 색상 팔레트가 결정적으로 생성됨",
            "bloom_reason": f"bloom({params.bloom})로 가지 밀도, 꽃 크기(size_factor), 초기 가지 길이가 변함",
            "message_influence": f"message_length로 꽃 개수(flower_count)에 간접 영향; flower_count={params.flower_count}",
        },
        "layers": {
            "stem": {"segments": [stem_seg]},
            "branches": {"segments": scaled_branches},
            "flowers": scaled_flowers,
        },
        "viewBox": "0 0 320 240",
    }


# =============================================================================
# 6. SVG 출력
# =============================================================================

def flower_to_svg_path(flower: FlowerData, color: str) -> str:
    """꽃 1개를 SVG path 문자열로"""
    angle_step = 360 / flower.petal_count
    paths: list[str] = []

    for i in range(flower.petal_count):
        angle = flower.rotation + i * angle_step
        d = generate_petal_path(
            flower.cx, flower.cy,
            angle,
            flower.petal_length,
            flower.petal_width,
        )
        paths.append(f'<path d="{d}" fill="{color}" opacity="0.9"/>')

    # 중심
    paths.append(
        f'<circle cx="{flower.cx:.2f}" cy="{flower.cy:.2f}" r="{flower.center_radius:.1f}" fill="{color}"/>'
    )
    return "\n    ".join(paths)


def to_svg(data: dict[str, Any], animate: bool = False) -> str:
    """JSON 데이터를 SVG 문자열로 변환. animate=True시 data-delay/data-duration 포함."""
    params = data["params"]
    layers = data["layers"]
    bg = params["background_color"]
    stem_color = "#5a8f5a"
    branch_color = "#5c935c"
    flower_color = params["flower_color"]
    anim = data.get("animation", {})

    def _attr(elem: dict, prefix: str) -> str:
        if not animate:
            return ""
        d = elem.get("delay", 0)
        dur = anim.get(f"{prefix}_duration", 500)
        return f' data-delay="{d}" data-duration="{dur}"'

    svg_parts: list[str] = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{data["viewBox"]}" width="320" height="240">',
        f'  <rect width="100%" height="100%" fill="{bg}"/>',
        '  <g id="layer-stem" data-layer="stem">',
    ]
    s0 = layers["stem"]["segments"][0]
    svg_parts.append(
        f'    <line id="{s0.get("id","stem-0")}" x1="{s0["x1"]:.1f}" y1="{s0["y1"]:.1f}" '
        f'x2="{s0["x2"]:.1f}" y2="{s0["y2"]:.1f}" '
        f'stroke="{stem_color}" stroke-width="2.5" stroke-linecap="round"'
        f'{_attr(s0, "stem")}/>'
    )
    svg_parts.append("  </g>")
    svg_parts.append('  <g id="layer-branches" data-layer="branches">')

    for seg in layers["branches"]["segments"]:
        svg_parts.append(
            f'    <path id="{seg.get("id","")}" d="{seg["path"]}" fill="none" '
            f'stroke="{branch_color}" stroke-width="1.5" stroke-linecap="round"'
            f'{_attr(seg, "branch")}/>'
        )
    svg_parts.append("  </g>")
    svg_parts.append('  <g id="layer-flowers" data-layer="flowers">')

    for f in layers["flowers"]:
        fd = FlowerData(
            cx=f["cx"], cy=f["cy"], petal_count=f["petal_count"],
            petal_length=f["petal_length"], petal_width=f["petal_width"],
            center_radius=f["center_radius"], rotation=f["rotation"],
            scale=f.get("scale", 1), color=f.get("color"),
        )
        color = f.get("color") or flower_color
        extra = f' id="{f.get("id","")}"{_attr(f, "flower")}' if animate else ""
        svg_parts.append(f'    <g{extra}>{flower_to_svg_path(fd, color)}</g>')
    svg_parts.append("  </g>")
    svg_parts.append("</svg>")

    return "\n".join(svg_parts)


# =============================================================================
# 7. CLI 진입점
# =============================================================================

def main():
    import argparse
    parser = argparse.ArgumentParser(description="자연스럽게 자라는 꽃 생성기")
    parser.add_argument("--seed", type=str, default="blooming-42", help="생성 seed")
    parser.add_argument("--bloom", type=float, default=0.6, help="꽃 성장 정도 0~1")
    parser.add_argument("--flowers", type=int, default=5, help="꽃 개수")
    parser.add_argument("--message", type=str, default="", help="메시지 (길이로 flower_type 영향)")
    parser.add_argument("--petals", type=int, default=5, help="꽃잎 개수")
    parser.add_argument("--color", type=str, default=None, help="꽃 색상 단색")
    parser.add_argument("--colors", type=str, default=None, help="꽃 색상 여러 개 (쉼표구분 hex)")
    parser.add_argument("--bg", type=str, default=None, help="배경색 (없으면 자동)")
    parser.add_argument("--output", type=str, default="flower.svg", help="SVG 출력 경로")
    parser.add_argument("--json", action="store_true", help="JSON만 출력")
    parser.add_argument("--animate", action="store_true", help="SVG에 data-delay/data-duration 추가")
    args = parser.parse_args()

    flower_colors = None
    if args.colors:
        flower_colors = [c.strip() for c in args.colors.split(",") if c.strip()]
    params = FlowerParams(
        seed=args.seed,
        bloom=args.bloom,
        flower_count=args.flowers,
        petal_count=args.petals,
        flower_color=args.color,
        flower_colors=flower_colors,
        background_color=args.bg,
        message_length=len(args.message),
    )

    data = generate_flower(params)

    if args.json:
        print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        svg = to_svg(data, animate=args.animate)
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(svg)
        print(f"Saved: {args.output}")


if __name__ == "__main__":
    main()
