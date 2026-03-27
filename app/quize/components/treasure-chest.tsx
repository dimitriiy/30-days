const FLOATING_GEMS = [
  { position: "-left-2 top-8", size: "text-2xl", delay: "[animation-delay:0.3s]" },
  { position: "-right-2 top-12", size: "text-xl", delay: "[animation-delay:0.8s]" },
  { position: "bottom-4 -left-4", size: "text-lg", delay: "[animation-delay:1.2s]" },
] as const;

export function TreasureChest() {
  return (
    <div className="z-10 flex flex-col items-center">
      <div className="relative flex size-56 items-center justify-center sm:size-64">
        <div className="absolute inset-0 rounded-full bg-[var(--quiz-purple)]/20 blur-3xl" />
        <div className="relative flex size-44 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--quiz-purple)] to-[var(--quiz-navy-light)] shadow-2xl sm:size-52">
          <span className="text-7xl sm:text-8xl">🧰</span>
        </div>
        {FLOATING_GEMS.map((gem, i) => (
          <div
            key={i}
            className={`absolute ${gem.position} ${gem.size} animate-bounce ${gem.delay}`}
          >
            💎
          </div>
        ))}
      </div>
    </div>
  );
}
