"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSeed } from "@/lib/seed-db";
import { getBloom } from "@/lib/bloom-db";
import { Step1Color, type BloomColor } from "@/components/bloom/Step1Color";
import { Step2Message } from "@/components/bloom/Step2Message";
import { Step3Feeling } from "@/components/bloom/Step3Feeling";

type Props = {
  seedId: string;
};

export function BloomFlow({ seedId }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [seedExists, setSeedExists] = useState<boolean | null>(null);
  const [alreadyBloomed, setAlreadyBloomed] = useState(false);

  useEffect(() => {
    (async () => {
      const [seed, bloom] = await Promise.all([getSeed(seedId), getBloom(seedId)]);
      setSeedExists(!!seed);
      setAlreadyBloomed(!!bloom);
    })();
  }, [seedId]);
  const [colors, setColors] = useState<BloomColor[]>([]);
  const [message, setMessage] = useState("");

  const handleStep1Next = () => setStep(2);
  const handleStep2Next = () => setStep(3);

  if (seedExists === null) {
    return <p className="text-center text-gray-400">불러오는 중...</p>;
  }
  if (!seedExists) {
    return (
      <div className="text-center space-y-4">
        <p className="text-gray-600">잘못된 링크예요.</p>
        <Link href="/" className="text-sm text-pink-600 hover:underline">
          처음으로
        </Link>
      </div>
    );
  }
  if (alreadyBloomed) {
    return (
      <div className="text-center space-y-4">
        <p className="text-gray-600">이 꽃은 이미 피어났어요.</p>
        <Link href={`/result/${seedId}`} className="text-sm text-pink-600 hover:underline">
          꽃 보러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm w-full">
      <div key={step} className="step-transition">
        {step === 1 && (
          <Step1Color
            value={colors}
            onChange={setColors}
            onNext={handleStep1Next}
          />
        )}
        {step === 2 && colors.length >= 2 && (
          <Step2Message
            color={colors[0]}
            value={message}
            onChange={setMessage}
            onNext={handleStep2Next}
          />
        )}
        {step === 3 && colors.length >= 2 && (
          <Step3Feeling
            seedId={seedId}
            colors={colors}
            message={message}
          />
        )}
      </div>
    </div>
  );
}
