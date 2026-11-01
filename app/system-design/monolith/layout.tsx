import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Системный дизайн — принципы и практика",
  description: "Короткие уроки, тесты и интерактивные модели по системному дизайну.",
};

export default function MonolithLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
