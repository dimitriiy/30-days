"use client";

import { useState, useSyncExternalStore } from "react";

import { CourseLab } from "./CourseLabs";
import { SimulationStand } from "./SimulationStand";
import { factCheckSources, lessonDetails } from "./lessonDetails";
import lessons from "./lessons.json";
import "./course.css";

type Question = (typeof lessons)[number]["questions"][number];

function QuestionField({ question, index, answer, checked, onAnswer }: {
  question: Question;
  index: number;
  answer: number | null;
  checked: boolean;
  onAnswer: (value: number) => void;
}) {
  const correct = answer === question.correct;

  return <fieldset className="course-question">
    <legend>{index + 1}. {question.prompt}</legend>
    {question.options.map((option, optionIndex) => {
      const resultClass = checked && optionIndex === question.correct ? "is-correct" : checked && answer === optionIndex ? "is-incorrect" : "";
      return <label key={option} className={`course-choice ${resultClass}`}><input type="radio" name={`question-${index}`} checked={answer === optionIndex} onChange={() => onAnswer(optionIndex)} /><span>{option}</span></label>;
    })}
    {checked && <p className={correct ? "course-feedback is-good" : "course-feedback is-bad"} aria-live="polite">{answer === null ? "Выбери ответ." : `${correct ? "Верно." : "Попробуй ещё раз."} ${question.explanation}`}</p>}
  </fieldset>;
}

function LessonView({ index, onComplete, onNext }: {
  index: number;
  onComplete: () => void;
  onNext: () => void;
}) {
  const lesson = lessons[index];
  const [answers, setAnswers] = useState<(number | null)[]>(lesson.questions.map(() => null));
  const [checked, setChecked] = useState(false);
  const allCorrect = answers.every((answer, questionIndex) => answer === lesson.questions[questionIndex].correct);

  function checkAnswers() {
    setChecked(true);
    if (allCorrect) onComplete();
  }

  return <article className="course-lesson">
    <div className="course-eyebrow">Тема {index + 1} из {lessons.length}</div>
    <h2>{lesson.title}</h2>
    <p className="course-meta">По материалу исходного PDF, страницы {lesson.pages}</p>
    <a className="course-jump" href="#course-lab">↓ Открыть интерактивную модель этой темы</a>
    <div className="course-copy" dangerouslySetInnerHTML={{ __html: lesson.content }} />
    <div className="course-copy course-detail" dangerouslySetInnerHTML={{ __html: lessonDetails[index] }} />
    <CourseLab lessonIndex={index} />
    {factCheckSources[index] && <aside className="course-sources"><strong>Проверить по первичным источникам</strong><ul>{factCheckSources[index].map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul></aside>}
    <section className="course-quiz" aria-labelledby="course-quiz-heading">
      <div className="course-eyebrow">Проверь себя</div>
      <h3 id="course-quiz-heading">Короткий тест</h3>
      <p>Выбери ответ на оба вопроса и нажми «Проверить». Ошибку можно исправить сразу.</p>
      {lesson.questions.map((question, questionIndex) => <QuestionField key={question.prompt} question={question} index={questionIndex} answer={answers[questionIndex]} checked={checked} onAnswer={value => {
        setAnswers(previous => previous.map((answer, i) => i === questionIndex ? value : answer));
        setChecked(false);
      }} />)}
      <div className="course-actions">
        <button type="button" className="course-button is-primary" onClick={checkAnswers}>Проверить</button>
        <button type="button" className="course-button" onClick={onNext}>{index === lessons.length - 1 ? "К первой теме" : "Следующая тема →"}</button>
      </div>
      {checked && <p className={`course-status ${allCorrect ? "is-good" : "is-bad"}`} role="status">{allCorrect ? "Тема пройдена. Можно идти дальше." : `Правильных ответов: ${answers.filter((answer, i) => answer === lesson.questions[i].correct).length} из ${lesson.questions.length}.`}</p>}
    </section>
  </article>;
}

export function MonolithCourse() {
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const sandbox = useSyncExternalStore(
    callback => { window.addEventListener("hashchange", callback); return () => window.removeEventListener("hashchange", callback); },
    () => window.location.hash === "#sandbox",
    () => false,
  );

  function show(index: number) {
    setCurrent(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return <div className="monolith-course" lang="ru"><div className="course-shell">
    <header className="course-header">
      <div className="course-eyebrow">Учебная выжимка · 23 главы PDF</div>
      <h1>Как думать о системах</h1>
      <p>Подробные конспекты по 11 темам, проверка после каждой темы и сквозной стенд, где можно проследить запрос через CPU, процессы, потоки, пул соединений и I/O.</p>
    </header>
    <nav className="course-sections" aria-label="Разделы курса"><a href="#course" aria-current={!sandbox ? "page" : undefined}>Конспекты и тесты</a><a href="#sandbox" aria-current={sandbox ? "page" : undefined}>Песочница</a><a href="/system-design/monolith/summary">Карта знаний</a></nav>
    {sandbox ? <div id="sandbox"><SimulationStand /></div> : <div className="course-layout" id="course">
      <nav className="course-nav" aria-label="Темы курса">
        <div className="course-nav-label">Темы {completed.length}/{lessons.length}</div>
        <progress aria-label="Прогресс по темам" value={completed.length} max={lessons.length} />
        <div className="course-nav-list">{lessons.map((lesson, index) => <button type="button" key={lesson.title} className={index === current ? "is-active" : ""} aria-current={index === current ? "step" : undefined} onClick={() => show(index)}>{index + 1}. {lesson.title}{completed.includes(index) && <span aria-label="Пройдено"> ✓</span>}</button>)}</div>
      </nav>
      <main><LessonView key={current} index={current} onComplete={() => setCompleted(previous => previous.includes(current) ? previous : [...previous, current])} onNext={() => show((current + 1) % lessons.length)} /></main>
    </div>}
  </div></div>;
}
