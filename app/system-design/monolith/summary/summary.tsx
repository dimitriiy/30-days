"use client";

import { useState, useSyncExternalStore } from "react";
import { blocks, selectedText, type SummarySection } from "./model";
import { getSnapshot, parseSelection, saveSelection, subscribe } from "./storage";

const serverSnapshot = () => "[]";

function Section({ section, selected, onToggle }: { section: SummarySection; selected: Set<string>; onToggle: (id: string) => void }) {
  return <section className="summary-section">
    <h4>{section.title}</h4>
    <div className="summary-items">{section.items.map(item => <div className="summary-item" key={item.id}>
      <label><input type="checkbox" checked={selected.has(item.id)} onChange={() => onToggle(item.id)} /><span>{item.text}</span></label>
      {item.answer && <p>{item.answer}</p>}
    </div>)}</div>
  </section>;
}

export function Summary() {
  const rawSelection = useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
  const [exportOpen, setExportOpen] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const selection = parseSelection(rawSelection);
  const selected = new Set(selection);
  const total = blocks.flatMap(block => block.topics.flatMap(topic => topic.sections.flatMap(section => section.items))).length;
  const exported = selectedText(selection);

  function toggle(id: string) {
    setStorageError(!saveSelection(selected.has(id) ? selection.filter(value => value !== id) : [...selection, id]));
  }

  return <div className="summary-page" lang="ru">
    <header className="summary-header">
      <a className="summary-back" href="/system-design/monolith">← К курсу</a>
      <div className="summary-kicker">Системный дизайн · рабочий конспект</div>
      <h1>Карта знаний</h1>
      <p>Отмечай вопросы и утверждения, к которым хочешь вернуться. Выбор сохраняется в этом браузере.</p>
      <div className="summary-toolbar"><span><strong>{selected.size}</strong> из {total} отмечено</span><button type="button" onClick={() => setExportOpen(true)}>Экспорт отмеченного</button></div>
      {storageError && <p role="alert">Не удалось сохранить выбор в браузере. Он доступен только до перезагрузки страницы.</p>}
    </header>
    {exportOpen && <div className="summary-modal-backdrop" onClick={() => setExportOpen(false)}>
      <section className="summary-modal" role="dialog" aria-modal="true" aria-labelledby="export-title" onClick={event => event.stopPropagation()} onKeyDown={event => { if (event.key === "Escape") setExportOpen(false); }}>
        <div className="summary-modal-header"><h2 id="export-title">Отмеченные пункты</h2><button type="button" autoFocus onClick={() => setExportOpen(false)} aria-label="Закрыть">×</button></div>
        {exported ? <pre>{exported}</pre> : <p>Пока ничего не отмечено.</p>}
      </section>
    </div>}
    <div className="summary-layout">
      <nav className="summary-nav" aria-label="Разделы конспекта"><div className="summary-nav-title">На этой странице</div>{blocks.map((block, index) => <a key={block.title} href={`#block-${index}`}>{block.title}</a>)}</nav>
      <main>{blocks.map((block, blockIndex) => <section className="summary-block" id={`block-${blockIndex}`} key={block.title}>
        <div className="summary-block-number">РАЗДЕЛ {String(blockIndex + 1).padStart(2, "0")}</div><h2>{block.title}</h2>
        <div className="summary-topics">{block.topics.map(topic => <details className="summary-topic" key={topic.title} open><summary><h3>{topic.title}</h3><span>⌄</span></summary><div className="summary-topic-content">{topic.sections.map(section => <Section key={section.title} section={section} selected={selected} onToggle={toggle} />)}</div></details>)}</div>
      </section>)}</main>
    </div>
  </div>;
}
