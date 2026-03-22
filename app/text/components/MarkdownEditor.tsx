"use client";

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function MarkdownEditor({ content, onChange }: MarkdownEditorProps) {
  return (
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Пиши Markdown здесь..."
      className="min-h-[70vh] w-full resize-y rounded-lg border border-border bg-card px-5 py-4 font-mono text-[15px] leading-7 text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
    />
  );
}
