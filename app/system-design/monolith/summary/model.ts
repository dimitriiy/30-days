import data from "./summary.json";

export type SummaryItem = { id: string; text: string; answer?: string };
export type SummarySection = { title: string; items: SummaryItem[] };
export type SummaryTopic = { title: string; sections: SummarySection[] };
export type SummaryBlock = { title: string; topics: SummaryTopic[] };

export const blocks: SummaryBlock[] = data;

export function selectedText(selected: string[]): string {
  const ids = new Set(selected);
  return blocks.flatMap(block => {
    const topics = block.topics.flatMap(topic => {
      const sections = topic.sections.flatMap(section => {
        const items = section.items.filter(item => ids.has(item.id));
        return items.length ? [`${section.title}\n${items.map(item => `☑ ${item.text}${item.answer ? `\n${item.answer}` : ""}`).join("\n\n")}`] : [];
      });
      return sections.length ? [`${topic.title}\n\n${sections.join("\n\n")}`] : [];
    });
    return topics.length ? [`${block.title}\n\n${topics.join("\n\n")}`] : [];
  }).join("\n\n---\n\n");
}
