import type { BloomColor } from "@/components/bloom/Step1Color";

export type BloomFeeling = "happy" | "calm" | "excited" | "supportive";

export type BloomData = {
  colors?: BloomColor[];
  color?: BloomColor;  // 구버전 호환
  message: string;
  feeling: BloomFeeling;
};
