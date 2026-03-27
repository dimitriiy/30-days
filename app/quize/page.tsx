"use client";

import Link from "next/link";
import { QuizButton, QuizScreen, Sparkles, TreasureChest } from "./components";
import { gameInProgress } from "./models";

export default function QuizWelcome() {
  return (
    <QuizScreen
      variant="dark"
      className="items-center justify-between px-6 py-12"
    >
      <Sparkles />

      <div className="z-10 flex flex-col items-center gap-4 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Квиз
        </h1>
        <p className="max-w-xs text-sm leading-relaxed text-[var(--quiz-text-muted)]">
          1,000+ quizzes to challenge you and your friends on all topics!
        </p>
      </div>

      <TreasureChest />

      <div className="z-10 w-full max-w-xs">
        <Link href="/quize/1/play">
          <QuizButton
            variant="primary"
            size="xl"
            className="w-full"
            onClick={() => gameInProgress.set(true)}
          >
            Start playing
          </QuizButton>
        </Link>
      </div>
    </QuizScreen>
  );
}
