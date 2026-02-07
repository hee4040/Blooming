"use client";

import { useEffect, useState } from "react";
import { getSeed } from "@/lib/seed-store";
import { getBloom } from "@/lib/bloom-store";
import {
  seedBloomToFlowerParams,
  DEFAULT_FLOWER_PARAMS,
  type FlowerParams,
} from "@/lib/flower-params";
import {
  computeFlowerLayout,
  CENTER_X,
  CENTER_Y_BOTTOM,
  STEM_TOP_Y,
} from "@/lib/flower-layout";
import { fetchFlowerData, type FlowerData } from "@/lib/flower-api";
import { FlowerGrowthView } from "./FlowerGrowthView";

const BLOOM_COLOR_HEX: Record<string, string> = {
  pink: "#F8B4C4",
  peach: "#FFDAB9",
  lavender: "#E6E6FA",
  mint: "#B5EAD7",
  cream: "#FFF8E7",
  coral: "#F08080",
};

const STEM_COLOR = "#5a8f5a";
const LEAF_COLOR = "#5c935c";
const SEED_COLOR = "#7a6342";

/** 배경에 휘날리는 꽃잎 (선택한 색상 사용) */
function FloatingPetals({ colors }: { colors: string[] }) {
  if (colors.length === 0) return null;

  const petals = [
    { x: "8%", y: "15%", size: 12, delay: 0, dur: 6 },
    { x: "88%", y: "20%", size: 10, delay: 1.2, dur: 7 },
    { x: "15%", y: "75%", size: 14, delay: 2.5, dur: 5.5 },
    { x: "85%", y: "80%", size: 9, delay: 0.8, dur: 6.5 },
    { x: "45%", y: "10%", size: 11, delay: 1.8, dur: 7.2 },
    { x: "55%", y: "85%", size: 13, delay: 0.3, dur: 5.8 },
    { x: "5%", y: "50%", size: 8, delay: 2.2, dur: 6.8 },
    { x: "92%", y: "45%", size: 15, delay: 1.5, dur: 6.2 },
    { x: "25%", y: "35%", size: 10, delay: 2.8, dur: 7 },
    { x: "70%", y: "60%", size: 12, delay: 0.5, dur: 5.5 },
    { x: "35%", y: "90%", size: 9, delay: 1.9, dur: 6.4 },
    { x: "78%", y: "25%", size: 11, delay: 2.1, dur: 7.5 },
    { x: "12%", y: "55%", size: 13, delay: 0.7, dur: 6 },
    { x: "95%", y: "70%", size: 8, delay: 2.4, dur: 5.9 },
    { x: "50%", y: "40%", size: 10, delay: 1.1, dur: 7.1 },
  ];

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden
    >
      {petals.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size * 1.4,
            backgroundColor: colors[i % colors.length],
            opacity: 0.4,
            transform: `rotate(${i * 24}deg)`,
            animation: `floatPetal ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

type Props = {
  seedId: string;
  messageText?: string;
};

/** Seed/Bloom 데이터 → API bloom 값 (0~1) */
function toBloomValue(seed: { message: string }, bloom: { message: string }): number {
  const msgLen = bloom.message.length;
  return Math.min(1, 0.35 + msgLen / 40 + (seed.message.length > 5 ? 0.1 : 0));
}

function BudToFlower({
  cx,
  cy,
  params,
  delay,
  isFocal,
}: {
  cx: number;
  cy: number;
  params: FlowerParams;
  delay: number;
  isFocal: boolean;
}) {
  const { petalCount, flowerColor, petalLength, petalWidth, centerRadius } =
    params;
  const angleStep = 360 / petalCount;
  const scale = isFocal ? 1.12 : 0.92;
  const opacity = isFocal ? 1 : 0.88;
  const gradId = isFocal ? "petalGradFocal" : "petalGrad";

  return (
    <g
      transform={`translate(${cx}, ${cy}) scale(${scale})`}
      style={{
        transformOrigin: `${cx}px ${cy}px`,
        filter: isFocal ? "saturate(1.15)" : undefined,
      }}
    >
      <ellipse
        cx="0"
        cy="0"
        rx="5"
        ry="7"
        fill={flowerColor}
        opacity={opacity}
        className="bloom-bud"
        style={{ animationDelay: `${delay}s`, transformOrigin: "0px 0px" }}
      />
      <g className="bloom-flower" style={{ animationDelay: `${delay + 0.35}s` }}>
        <circle
          cx="0"
          cy="0"
          r={centerRadius}
          fill={flowerColor}
          opacity={opacity}
          className="bloom-flower-center"
          style={{ transformOrigin: "0px 0px" }}
        />
        {Array.from({ length: petalCount }).map((_, i) => (
          <g
            key={i}
            transform={`rotate(${i * angleStep} 0 0)`}
            style={{ transformOrigin: "0px 0px" }}
          >
            <ellipse
              cx="0"
              cy={-petalLength / 2}
              rx={petalWidth}
              ry={petalLength / 2}
              fill={`url(#${gradId})`}
              className="bloom-flower-petal"
              style={{
                animationDelay: `${delay + 0.4 + i * 0.03}s`,
                transformOrigin: "0px 0px",
              }}
            />
          </g>
        ))}
      </g>
    </g>
  );
}

/** Python API 꽃 1개 렌더링 (꽃별 color 지원) */
function PythonFlower({
  flower,
  defaultColor,
  gradId,
}: {
  flower: FlowerData["layers"]["flowers"][number];
  defaultColor: string;
  gradId: string;
}) {
  const color = flower.color ?? defaultColor;
  const { cx, cy, petal_count, petal_length, petal_width, center_radius, rotation, delay } =
    flower;
  const angleStep = 360 / petal_count;
  const delaySec = delay / 1000;

  return (
    <g
      transform={`translate(${cx}, ${cy}) rotate(${rotation})`}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      <ellipse
        cx="0"
        cy="0"
        rx="5"
        ry="7"
        fill={color}
        opacity="0.9"
        className="bloom-bud"
        style={{ animationDelay: `${delaySec}s`, transformOrigin: "0px 0px" }}
      />
      <g className="bloom-flower" style={{ animationDelay: `${delaySec + 0.35}s` }}>
        <circle
          cx="0"
          cy="0"
          r={center_radius}
          fill={color}
          opacity="0.9"
          className="bloom-flower-center"
          style={{ transformOrigin: "0px 0px" }}
        />
        {Array.from({ length: petal_count }).map((_, i) => (
          <g
            key={i}
            transform={`rotate(${i * angleStep} 0 0)`}
            style={{ transformOrigin: "0px 0px" }}
          >
            <ellipse
              cx="0"
              cy={-petal_length / 2}
              rx={petal_width}
              ry={petal_length / 2}
              fill={`url(#${gradId})`}
              className="bloom-flower-petal"
              style={{
                animationDelay: `${delaySec + 0.4 + i * 0.03}s`,
                transformOrigin: "0px 0px",
              }}
            />
          </g>
        ))}
      </g>
    </g>
  );
}

function LeafNode({
  sx,
  sy,
  rotation,
  delay,
  scale = 1,
}: {
  sx: number;
  sy: number;
  rotation: number;
  delay: number;
  scale?: number;
}) {
  const length = 10 * scale;
  const width = 3.5 * scale;
  return (
    <g transform={`translate(${sx}, ${sy}) rotate(${rotation})`}>
      <ellipse
        cx={length / 2}
        cy="0"
        rx={length / 2}
        ry={width}
        fill={LEAF_COLOR}
        className="bloom-leaf"
        style={{ animationDelay: `${delay}s`, transformOrigin: "0px 0px" }}
      />
    </g>
  );
}

function FlowerSvgTS({ params }: { params: FlowerParams }) {
  const layout = computeFlowerLayout(params);
  const { flowerColor } = params;

  return (
    <svg
      viewBox="0 0 320 240"
      className="w-full h-full"
      aria-hidden
      style={{ overflow: "visible" }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="petalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={flowerColor} stopOpacity="0.92" />
          <stop offset="100%" stopColor={flowerColor} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="petalGradFocal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={flowerColor} stopOpacity="1" />
          <stop offset="100%" stopColor={flowerColor} stopOpacity="0.92" />
        </linearGradient>
      </defs>
      <g className="flower-composition">
        <g className="bloom-stems">
          <circle
            cx={CENTER_X}
            cy={CENTER_Y_BOTTOM}
            r="5"
            fill={SEED_COLOR}
            className="bloom-seed"
          />
          <line
            x1={CENTER_X}
            y1={CENTER_Y_BOTTOM - 6}
            x2={CENTER_X}
            y2={STEM_TOP_Y}
            stroke={STEM_COLOR}
            strokeWidth="2"
            strokeLinecap="round"
            className="bloom-main-stem"
          />
          {layout.branches.map((b, i) => (
            <path
              key={i}
              d={b.path}
              fill="none"
              stroke={STEM_COLOR}
              strokeWidth="1.6"
              strokeLinecap="round"
              pathLength="1"
              className="bloom-branch"
              style={{ animationDelay: `${b.delay}s` }}
            />
          ))}
          {layout.leaves.map((l, i) => (
            <LeafNode key={i} {...l} />
          ))}
        </g>
        <g className="bloom-flowers">
          {layout.flowers.map((f, i) => (
            <BudToFlower
              key={i}
              cx={f.x}
              cy={f.y}
              params={params}
              delay={f.delay}
              isFocal={f.isFocal}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}

function FlowerSvgPython({ data }: { data: FlowerData }) {
  const { params, layers } = data;
  const { flower_color } = params;
  const stem = layers.stem.segments[0];

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
        {[...new Set(layers.flowers.map((f) => f.color).filter((c): c is string => Boolean(c)))].map((c) => (
          <linearGradient key={c} id={`petalGradPy-${c.replace("#", "")}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c} stopOpacity="0.92" />
            <stop offset="100%" stopColor={c} stopOpacity="0.8" />
          </linearGradient>
        ))}
      </defs>
      <g className="flower-composition">
        <g className="bloom-stems">
          <circle
            cx={stem.x1}
            cy={stem.y1}
            r="3"
            fill={SEED_COLOR}
            className="bloom-seed"
          />
          <line
            x1={stem.x1}
            y1={stem.y1}
            x2={stem.x2}
            y2={stem.y2}
            stroke={STEM_COLOR}
            strokeWidth="2.2"
            strokeLinecap="round"
            className="bloom-main-stem"
            style={{ animationDelay: `${stem.delay / 1000}s` }}
          />
          {layers.branches.segments.map((seg) => (
            <path
              key={seg.id}
              d={seg.path}
              fill="none"
              stroke={STEM_COLOR}
              strokeWidth={seg.stroke_width ?? 1.5}
              strokeLinecap="round"
              pathLength="1"
              className="bloom-branch"
              style={{ animationDelay: `${seg.delay / 1000}s` }}
            />
          ))}
        </g>
        <g className="bloom-flowers">
          {layers.flowers.map((flower) => (
            <PythonFlower
              key={flower.id}
              flower={flower}
              defaultColor={flower_color}
              gradId={flower.color ? `petalGradPy-${flower.color.replace("#", "")}` : "petalGradPy"}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}

export function FlowerBloom({ seedId, messageText }: Props) {
  const [showMessage, setShowMessage] = useState(false);
  const [pythonData, setPythonData] = useState<FlowerData | null>(null);
  const [usePython, setUsePython] = useState(true);

  const seed = getSeed(seedId);
  const bloom = getBloom(seedId);
  const finalMessage = messageText ?? (bloom?.message || "이 꽃은 두 사람의 마음으로 피어났어요.");

  const params =
    seed && bloom ? seedBloomToFlowerParams(seed, bloom) : DEFAULT_FLOWER_PARAMS;

  useEffect(() => {
    if (!seed || !bloom || !usePython) return;

    const bloomValue = toBloomValue(seed, bloom);
    const resolvedColors = bloom.colors?.length ? bloom.colors : (bloom.color ? [bloom.color] : []);
    const flowerColors =
      resolvedColors.length >= 2
        ? resolvedColors.map((c) => BLOOM_COLOR_HEX[c]).filter(Boolean)
        : resolvedColors.length === 1
          ? [BLOOM_COLOR_HEX[resolvedColors[0]]].filter(Boolean)
          : undefined;
    const baseCount = 5;
    const messageForCount = seed.message ?? bloom.message ?? "";
    const extraFromMessage = Math.floor(messageForCount.length / 3);
    const flowerCount = Math.max(2, Math.min(15, baseCount + extraFromMessage));
    fetchFlowerData({
      seed: seedId,
      bloom: bloomValue,
      flowerCount,
      message: bloom.message,
      colors: flowerColors,
    })
      .then(setPythonData)
      .catch(() => setUsePython(false));
  }, [seedId, seed, bloom, usePython]);

  useEffect(() => {
    const msgStart = pythonData?.timeline?.message?.start ?? 6000;
    const t = setTimeout(() => setShowMessage(true), msgStart);
    return () => clearTimeout(t);
  }, [pythonData?.timeline?.message?.start]);

  const bgColor = pythonData
    ? pythonData.params.background_color
    : params.backgroundColor;

  const resolvedColors = bloom?.colors?.length ? bloom.colors : (bloom?.color ? [bloom.color] : []);
  const petalColors = resolvedColors.length
    ? resolvedColors.map((c) => BLOOM_COLOR_HEX[c]).filter(Boolean)
    : [params.flowerColor ?? "#F8B4C4"];

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <FloatingPetals colors={petalColors} />
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="w-full h-full min-w-0 min-h-0">
          {pythonData ? (
            <FlowerGrowthView data={pythonData} />
          ) : usePython && seed && bloom ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">꽃을 피우고 있어요...</div>
          ) : (
            <FlowerSvgTS params={params} />
          )}
        </div>
      </div>
      <p
        className={`
          absolute bottom-16 left-1/2 -translate-x-1/2 z-10 px-8 text-center text-xs text-gray-400
          transition-opacity duration-1000 transition-transform duration-1000
          ${showMessage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
        `}
      >
        {finalMessage}
      </p>
    </main>
  );
}
