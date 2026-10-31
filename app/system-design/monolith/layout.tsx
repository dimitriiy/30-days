import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Тест по системному дизайну монолита",
  description: "50 вопросов о проектировании монолитного приложения.",
};

export default function MonolithLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
