import type { SeedData } from "@/lib/seed-types";
import type { BloomData } from "@/lib/bloom-types";

export type FlowerType = "round" | "soft" | "sharp";

export type FlowerParams = {
  petalCount: number;
  flowerColor: string;
  backgroundColor: string;
  flowerType: FlowerType;
  branchCount: number;
  spreadWidth: number;
  moodIntensity: number;
  petalLength: number;
  petalWidth: number;
  centerRadius: number;
};

export const DEFAULT_FLOWER_PARAMS: FlowerParams = {
  petalCount: 5,
  flowerColor: "#F8B4C4",
  backgroundColor: "#fefaf8",
  flowerType: "soft",
  branchCount: 2,
  spreadWidth: 100,
  moodIntensity: 0.5,
  petalLength: 16,
  petalWidth: 5,
  centerRadius: 4,
};

const BLOOM_COLOR_MAP: Record<string, string> = {
  pink: "#F8B4C4",
  peach: "#FFDAB9",
  lavender: "#E6E6FA",
  mint: "#B5EAD7",
  cream: "#FFF8E7",
};

const MOOD_BASE_COLOR: Record<string, string> = {
  warm: "#F8B4C4",
  exciting: "#F08080",
  calm: "#E6E6FA",
  supportive: "#B5EAD7",
};

export function seedBloomToFlowerParams(seed: SeedData, bloom: BloomData): FlowerParams {
  const petalCount = Math.min(12, Math.max(5, 5 + Math.floor(bloom.message.length / 5)));
  const branchCount = Math.min(5, Math.max(1, 1 + Math.floor(bloom.message.length / 4)));
  const spreadWidth = 60 + branchCount * 35;

  let flowerType: FlowerType = "soft";
  let backgroundColor = "#fefaf8";
  switch (seed.dayType) {
    case "anniversary":
      flowerType = "round";
      backgroundColor = "#fff5f5";
      break;
    case "birthday":
      flowerType = "soft";
      backgroundColor = "#fffef5";
      break;
    case "cheer":
      flowerType = "sharp";
      backgroundColor = "#f5faf8";
      break;
    case "today":
      flowerType = "soft";
      backgroundColor = "#fafafa";
      break;
  }

  const firstColor = bloom.colors?.[0] ?? bloom.color;
  let flowerColor = firstColor ? (BLOOM_COLOR_MAP[firstColor] ?? MOOD_BASE_COLOR[seed.mood]) : MOOD_BASE_COLOR[seed.mood] ?? "#F8B4C4";
  const moodAdjust = MOOD_BASE_COLOR[seed.mood];
  if (moodAdjust && bloom.message.length > 10 && !firstColor) {
    flowerColor = moodAdjust;
  }

  let petalLength = 16;
  let petalWidth = 5;
  let centerRadius = 4;
  switch (flowerType) {
    case "round":
      petalLength = 14;
      petalWidth = 6;
      centerRadius = 5;
      break;
    case "sharp":
      petalLength = 18;
      petalWidth = 4;
      centerRadius = 3;
      break;
    case "soft":
    default:
      break;
  }

  const moodIntensity = bloom.message.length > 20 ? 1 : bloom.message.length > 10 ? 0.7 : 0.5;

  return {
    petalCount,
    flowerColor,
    backgroundColor,
    flowerType,
    branchCount,
    spreadWidth,
    moodIntensity,
    petalLength,
    petalWidth,
    centerRadius,
  };
}
