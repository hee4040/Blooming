"use client";

import Link from "next/link";
import { useState } from "react";
import { Step1DayType, type DayType } from "@/components/seed/steps/Step1DayType";
import { Step2Message } from "@/components/seed/steps/Step2Message";
import { Step3Mood, type Mood } from "@/components/seed/steps/Step3Mood";
import { SeedCompleted } from "@/components/seed/SeedCompleted";
import { SeedShareLink } from "@/components/seed/SeedShareLink";
import { createSeed } from "@/lib/seed-db";

export default function SeedPage() {
  const [step, setStep] = useState<1 | 2 | 3 | "completed" | "share">(1);
  const [dayType, setDayType] = useState<DayType | null>(null);
  const [message, setMessage] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [seedId, setSeedId] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleStep1Next = () => setStep(2);
  const handleStep2Back = () => setStep(1);
  const handleStep2Next = () => setStep(3);
  const handleStep3Back = () => setStep(2);
  const handleStep3Next = () => {
    if (!dayType || !mood) return;
    setStep("completed");
  };
  const handleShare = async () => {
    if (!dayType || !mood || isSharing) return;
    setShareError(null);
    setIsSharing(true);
    try {
      const { id } = await createSeed({ dayType, message, mood });
      setSeedId(id);
      setStep("share");
    } catch (e) {
      setShareError(e instanceof Error ? e.message : "저장에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-sm w-full">
        <div key={step} className="step-transition">
          {step === 1 && (
            <Step1DayType
              value={dayType}
              onChange={setDayType}
              onNext={handleStep1Next}
            />
          )}
          {step === 2 && (
            <Step2Message
              value={message}
              onChange={setMessage}
              onNext={handleStep2Next}
              onBack={handleStep2Back}
            />
          )}
          {step === 3 && (
            <Step3Mood
              value={mood}
              onChange={setMood}
              onNext={handleStep3Next}
              onBack={handleStep3Back}
            />
          )}
          {step === "completed" && (
            <>
              <SeedCompleted onShare={handleShare} disabled={isSharing} />
              {shareError && (
                <p className="mt-4 text-center text-sm text-red-500">{shareError}</p>
              )}
            </>
          )}
          {step === "share" && seedId && (
            <SeedShareLink seedId={seedId} />
          )}
        </div>
        {step !== "completed" && step !== "share" && (
          <Link
            href="/"
            className="block mt-12 text-center text-sm text-gray-400 hover:text-gray-600"
          >
            ← Landing으로
          </Link>
        )}
      </div>
    </main>
  );
}
