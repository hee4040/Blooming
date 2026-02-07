"use client";

import type { FlowerData } from "@/lib/flower-api";

const STEM_COLOR = "#5a8f5a";
const SEED_COLOR = "#7a6342";

export type GrowthStage = "seed" | "branches" | "flowers" | "message";

type FlowerGrowthViewProps = {
  data: FlowerData;
};

/** 1) 씨앗 (점/작은 원) */
function FlowerStageSeed({
  segment,
  duration,
  delay,
}: {
  segment: FlowerData["layers"]["stem"]["segments"][0];
  duration: number;
  delay: number;
}) {
  return (
    <circle
      cx={segment.x1}
      cy={segment.y1}
      r="3"
      fill={SEED_COLOR}
      className="flower-growth-seed"
      style={{
        transformOrigin: `${segment.x1}px ${segment.y1}px`,
        animation: `flowerSeedAppear ${duration}ms ease-out forwards`,
        animationDelay: `${delay / 1000}s`,
        opacity: 0,
      }}
    />
  );
}

/** 2) 줄기 (현재 구조에서는 시드와 동일 지점이라 stroke 없음) */
function FlowerStageStem({
  segment,
  duration,
  delay,
}: {
  segment: FlowerData["layers"]["stem"]["segments"][0];
  duration: number;
  delay: number;
}) {
  if (segment.x1 === segment.x2 && segment.y1 === segment.y2) return null;
  return (
    <line
      x1={segment.x1}
      y1={segment.y1}
      x2={segment.x2}
      y2={segment.y2}
      stroke={STEM_COLOR}
      strokeWidth="2.2"
      strokeLinecap="round"
      style={{
        strokeDasharray: 1,
        animation: `flowerPathDraw ${duration}ms ease-out forwards`,
        animationDelay: `${delay / 1000}s`,
        opacity: 0,
      }}
    />
  );
}

/** 가지 분기 */
function FlowerStageBranches({
  segments,
  anim,
  visibleCount,
}: {
  segments: FlowerData["layers"]["branches"]["segments"];
  anim: FlowerData["animation"];
  visibleCount: number;
}) {
  const duration = anim.branch_duration ?? 500;
  return (
    <>
      {segments.slice(0, visibleCount).map((seg) => (
        <path
          key={seg.id}
          d={seg.path}
          fill="none"
          stroke={STEM_COLOR}
          strokeWidth={seg.stroke_width ?? 1.5}
          strokeLinecap="round"
          pathLength={1}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: 0,
            animation: `flowerPathDraw ${duration}ms ease-out forwards`,
            animationDelay: `${(seg.delay ?? 0) / 1000}s`,
          }}
        />
      ))}
    </>
  );
}

/** 꽃 하나씩 */
function FlowerStageFlowers({
  flowers,
  flowerColor,
  gradIds,
  visibleCount,
}: {
  flowers: FlowerData["layers"]["flowers"];
  flowerColor: string;
  gradIds: Map<string, string>;
  visibleCount: number;
}) {
  return (
    <>
      {flowers.slice(0, visibleCount).map((flower) => {
        const color = flower.color ?? flowerColor;
        const gradId = flower.color ? gradIds.get(flower.color) ?? "petalGradPy" : "petalGradPy";
        const angleStep = 360 / flower.petal_count;
        const delaySec = (flower.delay ?? 0) / 1000;

        return (
          <g
            key={flower.id}
            transform={`translate(${flower.cx}, ${flower.cy}) rotate(${flower.rotation})`}
            style={{ transformOrigin: `${flower.cx}px ${flower.cy}px` }}
          >
            <circle
              cx="0"
              cy="0"
              r={flower.center_radius}
              fill={color}
              className="flower-growth-center"
              style={{
                animation: "flowerCenterAppear 0.4s ease-out forwards",
                animationDelay: `${delaySec}s`,
                opacity: 0,
              }}
            />
            {Array.from({ length: flower.petal_count }).map((_, i) => (
              <g key={i} transform={`rotate(${i * angleStep} 0 0)`}>
                <ellipse
                  cx="0"
                  cy={-flower.petal_length / 2}
                  rx={flower.petal_width}
                  ry={flower.petal_length / 2}
                  fill={`url(#${gradId})`}
                  style={{
                    animation: "flowerPetalGrow 0.5s ease-out forwards",
                    animationDelay: `${delaySec + 0.1 + i * 0.03}s`,
                    opacity: 0,
                    transformOrigin: "0 0",
                  }}
                />
              </g>
            ))}
          </g>
        );
      })}
    </>
  );
}

/** Python JSON 기반 단계별 꽃 성장 뷰 - timeline delay로 순차 등장 */
export function FlowerGrowthView({ data }: FlowerGrowthViewProps) {
  const { params, layers } = data;
  const anim = data.animation ?? {};
  const { flower_color } = params;

  const seedSegment = layers.stem.segments[0];
  const branches = layers.branches.segments ?? [];
  const flowers = layers.flowers ?? [];
  if (!seedSegment) return null;

  const gradIds = new Map<string, string>();
  flowers.forEach((f) => {
    if (f.color && !gradIds.has(f.color)) {
      gradIds.set(f.color, `petalGradPy-${f.color.replace("#", "")}`);
    }
  });

  return (
    <svg
      viewBox={data.viewBox}
      className="w-full h-full"
      aria-hidden
      style={{ overflow: "visible" }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="petalGradPy" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={flower_color} stopOpacity="0.92" />
          <stop offset="100%" stopColor={flower_color} stopOpacity="0.8" />
        </linearGradient>
        {[...gradIds].map(([color, id]) => (
          <linearGradient key={color} id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.92" />
            <stop offset="100%" stopColor={color} stopOpacity="0.8" />
          </linearGradient>
        ))}
      </defs>
      <g className="flower-growth-composition">
        <FlowerStageSeed
          segment={seedSegment}
          duration={anim.seed_duration ?? 600}
          delay={seedSegment.delay ?? 0}
        />
        <FlowerStageStem
          segment={seedSegment}
          duration={anim.stem_duration ?? 600}
          delay={seedSegment.delay ?? 0}
        />
        <g className="flower-growth-branches">
          <FlowerStageBranches segments={branches} anim={anim} visibleCount={branches.length} />
        </g>
        <g className="flower-growth-flowers">
          <FlowerStageFlowers
            flowers={flowers}
            flowerColor={flower_color}
            gradIds={gradIds}
            visibleCount={flowers.length}
          />
        </g>
      </g>
    </svg>
  );
}
