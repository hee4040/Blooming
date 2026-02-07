/**
 * Python flower generator API 클라이언트
 * /api/flower 호출 후 JSON 반환
 */

export type FlowerData = {
  params: {
    seed: string;
    bloom: number;
    flower_type: "single" | "cluster" | "bouquet";
    flower_color: string;
    background_color: string;
  };
  animation: {
    seed_duration?: number;
    stem_duration?: number;
    branch_duration: number;
    flower_duration: number;
    stagger: { branch: number; flower: number };
  };
  timeline?: {
    seed: { start: number; duration: number };
    branches: { start: number; stagger: number };
    flowers: { start: number; stagger: number };
    message: { start: number };
  };
  meta?: {
    seed_reason: string;
    bloom_reason: string;
    message_influence: string;
  };
  layers: {
    stem: { segments: Array<{ id: string; x1: number; y1: number; x2: number; y2: number; delay: number }> };
    branches: { segments: Array<{ id: string; path: string; depth: number; delay: number; stroke_width?: number }> };
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
      color?: string;
      delay: number;
    }>;
  };
  viewBox: string;
};

export type FlowerApiParams = {
  seed: string;
  bloom: number;
  flowerCount?: number;
  message?: string;
  color?: string;
  colors?: string[]; // 여러 꽃 색상
};

export async function fetchFlowerData(params: FlowerApiParams): Promise<FlowerData> {
  const q = new URLSearchParams({
    seed: params.seed,
    bloom: String(params.bloom),
  });
  if (params.flowerCount != null) q.set("flowers", String(params.flowerCount));
  if (params.message) q.set("message", params.message);
  if (params.colors?.length) q.set("colors", params.colors.join(","));
  else if (params.color) q.set("color", params.color);

  const res = await fetch(`/api/flower?${q.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Flower API error: ${res.status}`);
  }
  return res.json();
}
