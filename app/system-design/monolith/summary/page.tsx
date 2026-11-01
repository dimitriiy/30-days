import type { Metadata } from "next";
import { Summary } from "./summary";
import "./summary.css";

export const metadata: Metadata = { title: "Конспект по системному дизайну" };

export default function SummaryPage() {
  return <Summary />;
}
