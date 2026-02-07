"use client";

import { useState } from "react";
import { Step1Color, type BloomColor } from "@/components/bloom/Step1Color";
import { Step2Message } from "@/components/bloom/Step2Message";
import { Step3Feeling } from "@/components/bloom/Step3Feeling";

type Props = {
  seedId: string;
};

export function BloomFlow({ seedId }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [colors, setColors] = useState<BloomColor[]>([]);
  const [message, setMessage] = useState("");

  const handleStep1Next = () => setStep(2);
  const handleStep2Next = () => setStep(3);

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
