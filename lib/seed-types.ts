import type { DayType } from "@/components/seed/steps/Step1DayType";
import type { Mood } from "@/components/seed/steps/Step3Mood";

export type SeedData = {
  dayType: DayType;
  message: string;
  mood: Mood;
};
