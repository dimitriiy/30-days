import type { Metadata } from "next";
import { FinalQuiz } from "./FinalQuiz";

export const metadata: Metadata = {
  title: "Итоговый тест — системный дизайн монолита",
};

export default function FinalTestPage() {
  return <FinalQuiz />;
}
