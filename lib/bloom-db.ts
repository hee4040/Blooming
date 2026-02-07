import { supabase } from "./supabase";
import type { BloomData } from "./bloom-types";

type DbBloom = {
  seed_id: string;
  colors: string[];
  message: string;
  feeling: string;
};

function toBloomData(row: DbBloom): BloomData {
  const colors = row.colors as BloomData["colors"];
  return {
    colors: colors?.length ? colors : undefined,
    color: colors?.[0],
    message: row.message,
    feeling: row.feeling as BloomData["feeling"],
  };
}

/** Bloom 생성 (받는 사람) - seed가 이미 bloom되었으면 upsert */
export async function createBloom(
  seedId: string,
  data: BloomData
): Promise<void> {
  const colors = data.colors?.length
    ? data.colors
    : data.color
      ? [data.color]
      : [];
  if (colors.length < 2) throw new Error("색상을 2개 이상 선택해 주세요");

  const { error } = await supabase.from("blooms").upsert(
    {
      seed_id: seedId,
      colors,
      message: data.message || "",
      feeling: data.feeling,
    },
    { onConflict: "seed_id" }
  );

  if (error) throw new Error(error.message);
}

/** Bloom 조회 */
export async function getBloom(seedId: string): Promise<BloomData | null> {
  const { data, error } = await supabase
    .from("blooms")
    .select("colors, message, feeling")
    .eq("seed_id", seedId)
    .single();

  if (error || !data) return null;
  return toBloomData(data as DbBloom);
}
