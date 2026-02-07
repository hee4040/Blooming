import Link from "next/link";
import { BloomFlow } from "@/components/bloom/BloomFlow";

type Props = {
  params: Promise<{ seedId: string }>;
};

export default async function BloomPage({ params }: Props) {
  const { seedId } = await params;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <BloomFlow seedId={seedId} />
      <Link
        href="/"
        className="block mt-12 text-center text-sm text-gray-400 hover:text-gray-600"
      >
        ← Landing으로
      </Link>
    </main>
  );
}
