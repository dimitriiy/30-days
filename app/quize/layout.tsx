import type { ReactNode } from "react";
import "./quiz-theme.css";

export default function QuizLayout({ children }: { children: ReactNode }) {
  return (
    <div className="quiz-theme h-screen font-sans antialiased">
      {children}
    </div>
  );
}
