import { supabase } from "./supabase";
import type { SeedData } from "./seed-types";

type DbSeed = {
  id: string;
  day_type: string;
  message: string;
  mood: string;
};

function toSeedData(row: DbSeed): SeedData & { id: string } {
  return {
    id: row.id,
    dayType: row.day_type as SeedData["dayType"],
    message: row.message,
    mood: row.mood as SeedData["mood"],
  };
}

/** Seed 생성 (보내는 사람) */
export async function createSeed(data: SeedData): Promise<{ id: string }> {
  const { data: row, error } = await supabase
    .from("seeds")
    .insert({
      day_type: data.dayType,
      message: data.message.slice(0, 50),
      mood: data.mood,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { id: row.id };
}

/** Seed 조회 */
export async function getSeed(seedId: string): Promise<(SeedData & { id: string }) | null> {
  const { data, error } = await supabase
    .from("seeds")
    .select("id, day_type, message, mood")
    .eq("id", seedId)
    .single();

  if (error || !data) return null;
  return toSeedData(data as DbSeed);
}
