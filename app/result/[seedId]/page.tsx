import Link from "next/link";

type Props = {
  params: Promise<{ seedId: string }>;
};

export default async function ResultPage({ params }: Props) {
  const { seedId } = await params;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-xl font-medium text-center">꽃 결과</h1>
        <p className="text-gray-600 text-center text-sm">
          Seed ID: {seedId}
        </p>
        <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-500">
          Flower result placeholder
        </div>
        <Link
          href="/"
          className="block text-center text-sm text-gray-500 hover:text-gray-700"
        >
          ← Landing으로
        </Link>
      </div>
    </main>
  );
}
