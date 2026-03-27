const PARTICLES = [
  { position: "left-[10%] top-[8%]", size: "size-1.5", color: "bg-[var(--quiz-purple-light)]", opacity: "opacity-60", delay: "" },
  { position: "right-[15%] top-[15%]", size: "size-1", color: "bg-[var(--quiz-teal)]", opacity: "opacity-50", delay: "[animation-delay:0.5s]" },
  { position: "left-[20%] top-[30%]", size: "size-1", color: "bg-white", opacity: "opacity-30", delay: "[animation-delay:1s]" },
  { position: "right-[25%] top-[45%]", size: "size-1.5", color: "bg-[var(--quiz-purple-light)]", opacity: "opacity-40", delay: "[animation-delay:1.5s]" },
  { position: "left-[8%] bottom-[30%]", size: "size-1", color: "bg-[var(--quiz-teal)]", opacity: "opacity-50", delay: "[animation-delay:0.7s]" },
  { position: "right-[10%] bottom-[20%]", size: "size-1.5", color: "bg-white", opacity: "opacity-20", delay: "[animation-delay:1.2s]" },
] as const;

export function Sparkles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className={`absolute ${p.position} ${p.size} rounded-full ${p.color} ${p.opacity} animate-pulse ${p.delay}`}
        />
      ))}
    </div>
  );
}
