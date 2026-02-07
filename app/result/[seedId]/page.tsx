import { FlowerBloom } from "@/components/result/FlowerBloom";

type Props = {
  params: Promise<{ seedId: string }>;
};

export default async function ResultPage({ params }: Props) {
  const { seedId } = await params;

  return <FlowerBloom seedId={seedId} />;
}