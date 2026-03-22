import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownViewerProps {
  content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <div className="min-h-[70vh] px-5 py-4">
      <article className="prose prose-invert max-w-none prose-headings:scroll-mt-20 prose-pre:overflow-x-auto prose-table:w-full">
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
      </article>
    </div>
  );
}
