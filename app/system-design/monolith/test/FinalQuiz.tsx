"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import { topics } from "./topics";
import { allAnswered, isCorrect, questions, scoreAnswers, type Answers, type Question } from "./questions";
import { explanations } from "./explanations";
import "./quiz.css";

type Stage = "intro" | "questions" | "results";
type QuizProgress = {
  stage: Stage;
  index: number;
  answers: Answers;
  viewed: string[];
  revealed: string[];
};

const progressKey = "system-design-monolith-quiz-progress";

function AnswerExplanation({ question }: { question: Question }) {
  return <div className="answer-explanation">{explanations[question.id].map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>;
}

function Review({ answers, viewed }: { answers: Answers; viewed: string[] }) {
  const [onlyMistakes, setOnlyMistakes] = useState(false);
  const selected = questions.filter(question => !onlyMistakes || !isCorrect(question, answers));
  return <section className="quiz-review" id="quiz-review"><div className="quiz-review-heading"><h2>Разбор ответов</h2><label><input type="checkbox" checked={onlyMistakes} onChange={e => setOnlyMistakes(e.target.checked)} /> Только ошибки</label></div>
    {selected.length === 0 && <p>Ошибок нет. Можно посмотреть объяснения всех ответов.</p>}
    {selected.map(question => <details className="quiz-review-item" key={question.id}><summary><span className={isCorrect(question, answers) ? "quiz-correct" : "quiz-incorrect"}>{isCorrect(question, answers) ? "Верно" : "Ошибка"}</span><span>{question.prompt}</span></summary><div className="quiz-review-body"><p className="quiz-topic">Тема {question.lesson} · {topics[question.lesson - 1]}{viewed.includes(question.id) && " · Ответ был открыт во время теста"}</p><p><strong>Ваш ответ:</strong> {question.options[answers[question.id]]}</p>{!isCorrect(question, answers) && <p><strong>Правильный ответ:</strong> {question.options[question.correct]}</p>}<div className="quiz-explanation"><AnswerExplanation question={question} /></div></div></details>)}
  </section>;
}

export function FinalQuiz() {
  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [viewed, setViewed] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(progressKey);
      if (saved) {
        const progress = JSON.parse(saved) as Partial<QuizProgress>;
        if (progress.stage) setStage(progress.stage);
        if (typeof progress.index === "number" && progress.index >= 0 && progress.index < questions.length) setIndex(progress.index);
        if (progress.answers) setAnswers(progress.answers);
        if (progress.viewed) setViewed(progress.viewed);
        if (progress.revealed) setRevealed(progress.revealed);
      }
    } catch {
      localStorage.removeItem(progressKey);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(progressKey, JSON.stringify({ stage, index, answers, viewed, revealed } satisfies QuizProgress));
  }, [answers, index, isHydrated, revealed, stage, viewed]);
  const answered = questions.filter(question => answers[question.id] !== undefined).length;
  const question = questions[index];
  const score = scoreAnswers(answers);

  function navigate(next: number) {
    setIndex(next);
    heading.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    heading.current?.focus({ preventScroll: true });
  }

  function finish() {
    if (!allAnswered(answers)) return;
    setStage("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleAnswer() {
    if (!viewed.includes(question.id)) setViewed(previous => [...previous, question.id]);
    setRevealed(previous => previous.includes(question.id) ? previous.filter(id => id !== question.id) : [...previous, question.id]);
  }

  function restart() {
    setAnswers({});
    setViewed([]);
    setRevealed([]);
    setIndex(0);
    setStage("questions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return <div className="monolith-page quiz-page" lang="ru"><div className="quiz-shell"><header className="quiz-topbar"><strong>SYSTEM DESIGN</strong><span>SYSTEM DESIGN / ФИНАЛ</span></header><main className="quiz-main">
    {stage === "intro" && <><span className="quiz-kicker">СОБЕРИТЕ СИСТЕМУ В ГОЛОВЕ</span><h1>Итоговый тест</h1><p className="quiz-lead">Проверьте знания по всем темам системного дизайна монолита.</p><div className="quiz-facts"><div><strong>{questions.length}</strong><span>вопросов</span></div><div><strong>23</strong><span>темы</span></div><div><strong>1</strong><span>верный ответ в вопросе</span></div></div><div className="quiz-rules"><h2>Как проходит тест</h2><ul><li>Без таймера. Можно пропускать вопросы, возвращаться и менять ответы до завершения.</li><li>Правильный ответ с объяснением можно открыть сразу в любом вопросе. Такие вопросы будут отмечены в результате.</li><li>В результате — общий счёт, разбор ошибок и результат без подсказок.</li></ul></div><button className="quiz-primary" onClick={() => setStage("questions")}>Начать тест <ArrowRight size={18} /></button><p className="quiz-note">Прогресс сохраняется автоматически в этом браузере.</p></>}
    {stage === "questions" && <><div className="quiz-progress"><span>Отвечено {answered} / {questions.length}</span><span>{Math.round(answered / questions.length * 100)}%</span></div><progress aria-label="Прогресс теста" value={answered} max={questions.length} /><nav className="quiz-question-nav" aria-label="Вопросы теста">{questions.map((item, i) => <button key={item.id} onClick={() => navigate(i)} className={answers[item.id] !== undefined ? "is-answered" : ""} aria-current={i === index ? "step" : undefined} aria-label={`Вопрос ${i + 1}${answers[item.id] !== undefined ? ", ответ выбран" : ", без ответа"}`}>{i + 1}</button>)}</nav><span className="quiz-topic">Тема {question.lesson} · {topics[question.lesson - 1]}</span><h1 className="quiz-question-title" tabIndex={-1} ref={heading} id="question-title">{question.prompt}</h1><fieldset className="quiz-options" aria-labelledby="question-title"><legend>Выберите один ответ</legend>{question.options.map((option, i) => <label key={`${question.id}-${i}`} className={answers[question.id] === i ? "is-selected" : ""}><input type="radio" name={question.id} value={i} checked={answers[question.id] === i} onChange={() => setAnswers(previous => ({ ...previous, [question.id]: i }))} /><span>{option}</span>{answers[question.id] === i && <Check size={18} aria-hidden />}</label>)}</fieldset><div className="quiz-reveal"><button type="button" className="quiz-reveal-button" onClick={toggleAnswer} aria-expanded={revealed.includes(question.id)}>{revealed.includes(question.id) ? "Скрыть ответ" : "Посмотреть ответ и объяснение"}</button>{revealed.includes(question.id) && <div className="quiz-revealed-content" aria-live="polite"><strong>Правильный ответ: {question.options[question.correct]}</strong><AnswerExplanation question={question} /></div>}{viewed.includes(question.id) && <p className="quiz-viewed-note">Вы открывали ответ на этот вопрос. Это будет отмечено в результате.</p>}</div><div className="quiz-controls"><button className="quiz-secondary" disabled={index === 0} onClick={() => navigate(index - 1)}><ArrowLeft size={16} /> Назад</button>{index < questions.length - 1 && <button className="quiz-primary" onClick={() => navigate(index + 1)}>Дальше <ArrowRight size={16} /></button>}{index === questions.length - 1 && !allAnswered(answers) && <button className="quiz-primary" onClick={() => navigate(questions.findIndex(item => answers[item.id] === undefined))}>К пропущенному <ArrowRight size={16} /></button>}</div><div className="quiz-submit"><span>{allAnswered(answers) ? "Все ответы выбраны. Их можно ещё изменить." : `Осталось ответить: ${questions.length - answered}`}</span><button className="quiz-primary" disabled={!allAnswered(answers)} onClick={finish}>Проверить ответы <Check size={16} /></button></div><p className="quiz-note">Прогресс сохраняется автоматически.</p></>}
    {stage === "results" && <><span className="quiz-kicker">ПОПЫТКА ЗАВЕРШЕНА</span><h1>Результат и разбор</h1><div className="quiz-score" aria-live="polite"><strong>{score}<small> / {questions.length}</small></strong><div><b>{Math.round(score / questions.length * 100)}% верных ответов</b><p>{score === questions.length ? "Все ответы верны. Ниже можно проверить свои объяснения по разбору." : "Посмотрите, в каких темах возникли ошибки, и разберите причины выбора."}</p></div></div><div className="quiz-hint-summary"><strong>Открыто ответов: {viewed.length} из {questions.length}</strong><span>Без открытия ответа: {questions.filter(item => !viewed.includes(item.id) && isCorrect(item, answers)).length} верных из {questions.length - viewed.length}. Общий счёт выше включает ответы с подсказками.</span></div><section className="quiz-topics"><h2>Результат по темам</h2><p>Посмотрите разбор ответов по темам, в которых допустили ошибки.</p><div>{topics.map((topic, lessonIndex) => {const items = questions.filter(item => item.lesson === lessonIndex + 1);const correct = items.filter(item => isCorrect(item, answers)).length;return <div className={correct === items.length ? "topic-passed" : "topic-repeat"} key={topic}><span>{String(lessonIndex + 1).padStart(2, "0")} · {topic}</span><strong>{correct} / {items.length}</strong><small>{correct === items.length ? "Верно" : "Разобрать"}</small></div>;})}</div></section><Review answers={answers} viewed={viewed} /><div className="quiz-controls"><a className="quiz-secondary" href="#quiz-review">К разбору ответов</a><button className="quiz-primary" onClick={restart}><RotateCcw size={16} /> Пройти заново</button></div></>}
  </main></div></div>;
}
