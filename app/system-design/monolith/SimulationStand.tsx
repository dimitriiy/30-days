"use client";

import { useEffect, useMemo, useState } from "react";

import { RequestFlowDiagram } from "./RequestFlowDiagram";
import { simulate, type SegmentKind, type SimulationSettings } from "./simulation";
import "./simulation.css";

const initial: SimulationSettings = {
  requests: 8,
  arrivalInterval: 12,
  cores: 1,
  processes: 1,
  poolPerProcess: 2,
  workersPerProcess: 2,
  prepareMs: 10,
  databaseMs: 90,
  computeMs: 120,
  offloadCompute: false,
};

const stageLabels: Record<SegmentKind, string> = {
  "cpu-wait": "Ждёт CPU / свободный поток",
  prepare: "CPU: разбор запроса",
  "db-wait": "Ждёт соединение из пула",
  database: "I/O: ожидание базы",
  compute: "CPU: тяжёлый расчёт",
  finish: "CPU: формирование ответа",
};

const stageDescriptions: Record<SegmentKind, string> = {
  "cpu-wait": "Работа готова, но исполнитель или доступное ядро заняты. Это ожидание добавляется ко времени ответа.",
  prepare: "Поток процесса выполняет код на CPU. Другой JavaScript-обработчик в том же цикле пока не выполняется.",
  "db-wait": "Все соединения данного процесса заняты. Запрос ждёт в очереди пула, хотя его поток может обслуживать другие события.",
  database: "Соединение занято, идёт асинхронное ожидание базы. CPU приложения не занят этим запросом; работа самой базы здесь моделируется одной задержкой.",
  compute: "Тяжёлое вычисление потребляет CPU. В главном потоке оно задерживает другие обработчики этого процесса; в рабочем потоке главный цикл может продолжать работу.",
  finish: "Ответ снова требует CPU и затем выходит клиенту. Даже после готовности данных обработчик может подождать своей очереди.",
};

function Setting({ label, value, min, max, step = 1, unit = "", onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (value: number) => void;
}) {
  return <label className="stand-setting"><span>{label} <output>{value}{unit}</output></span><input type="range" min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value))} /></label>;
}

function SimulationView({ settings }: { settings: SimulationSettings }) {
  const result = useMemo(() => simulate(settings), [settings]);
  const [focused, setFocused] = useState(1);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const request = result.requests[focused - 1];
  const current = request.segments.find(segment => segment.start <= cursor && cursor < segment.end);
  const stage = cursor < request.arrival ? "Запрос ещё не пришёл" : cursor >= request.done ? "Ответ уже отправлен" : current ? stageLabels[current.kind] : "Переход к следующему этапу";

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setCursor(previous => Math.min(result.makespan, previous + Math.max(2, Math.round(result.makespan / 80)))), 70);
    return () => window.clearInterval(timer);
  }, [playing, result.makespan]);

  return <>
    <div className="stand-summary" aria-label="Результаты моделирования">
      <div><span>Оценка p95 ответа</span><strong>{result.p95Ms} мс</strong></div>
      <div><span>Последний ответ</span><strong>{result.makespan} мс</strong></div>
      <div><span>Занятость CPU</span><strong>{result.cpuUtilization}%</strong></div>
      <div><span>Пик соединений</span><strong>{result.peakConnections}/{settings.processes * settings.poolPerProcess}</strong></div>
    </div>
    <RequestFlowDiagram settings={settings} stage={current?.kind} process={request.process} requests={result.requests} cursor={cursor} />
    <p className="stand-core-note"><strong>CPU приложения:</strong> {settings.cores} {settings.cores === 1 ? "ядро" : settings.cores < 5 ? "ядра" : "ядер"} делят все потоки всех процессов. Ожидание базы не расходует CPU приложения, но удерживает соединение. Цветные полосы показывают только интервалы выполнения этапов; ожидание свободного ядра отдельно не отображается. Модель считает время целыми миллисекундами, поэтому округляет границы этапов.</p>
    <div className="stand-timeline-heading"><h3>Временная шкала</h3><p>Нажми строку запроса, затем двигай маркер времени или запусти воспроизведение.</p></div>
    <div className="stand-timeline-scroll"><div className="stand-timeline" role="group" aria-label="Временная шкала этапов всех запросов">
      <div className="stand-axis"><span>0 мс</span><span>{Math.round(result.makespan / 2)} мс</span><span>{result.makespan} мс</span></div>
      {result.requests.map(item => <button type="button" className={`stand-row ${focused === item.id ? "is-focused" : ""}`} key={item.id} onClick={() => setFocused(item.id)} aria-label={`Запрос ${item.id}, процесс ${item.process + 1}, ответ за ${item.done - item.arrival} мс`}>
        <span className="stand-row-label">R{item.id}<small>P{item.process + 1}</small></span>
        <span className="stand-track"><span className="stand-playhead" style={{ left: `${100 * cursor / result.makespan}%` }} />{item.segments.map((segment, index) => <span key={index} className={`stand-segment is-${segment.kind}`} style={{ left: `${100 * segment.start / result.makespan}%`, width: `${100 * (segment.end - segment.start) / result.makespan}%` }} title={`${stageLabels[segment.kind]}: ${segment.start}–${segment.end} мс`} />)}</span>
      </button>)}
    </div></div>
    <div className="stand-player"><button type="button" onClick={() => { if (cursor >= result.makespan) setCursor(0); setPlaying(!playing); }}>{playing ? "Пауза" : "▶ Воспроизвести"}</button><label>Момент: <output>{cursor} мс</output><input type="range" min="0" max={result.makespan} value={cursor} onChange={event => { setPlaying(false); setCursor(Number(event.target.value)); }} /></label></div>
    <div className="stand-explanation" aria-live="polite"><strong>R{focused} · процесс {request.process + 1} · {stage}</strong><p>{current ? stageDescriptions[current.kind] : cursor >= request.done ? `Запрос завершился за ${request.done - request.arrival} мс с учётом всех ожиданий.` : "Начни воспроизведение или перемести маркер к моменту поступления запроса."}</p></div>
    <div className="stand-legend" aria-label="Обозначения этапов">{(["cpu-wait", "prepare", "db-wait", "database", "compute", "finish"] as SegmentKind[]).map(kind => <span key={kind}><i className={`is-${kind}`} />{stageLabels[kind]}</span>)}</div>
    <p className="stand-measures">Среднее время ответа: {result.averageMs} мс · среднее ожидание соединения: {result.averageDatabaseWait} мс · максимум запросов в очередях пулов: {result.peakDatabaseQueue}. Оценка p95 рассчитывается по этой небольшой выборке запросов, поэтому при малом числе запросов может совпасть с самым долгим ответом.</p>
  </>;
}

export function SimulationStand() {
  const [settings, setSettings] = useState(initial);
  function change<K extends keyof SimulationSettings>(key: K, value: SimulationSettings[K]) {
    setSettings(previous => ({ ...previous, [key]: value }));
  }

  return <section className="system-stand" id="stand" aria-labelledby="stand-title">
    <div className="course-eyebrow">Сквозной интерактивный стенд</div>
    <h2 id="stand-title">Проследи запрос целиком</h2>
    <p className="stand-lead">Меняй аппаратные ресурсы и организацию исполнения. Смотри, когда запрос ждёт поток, ядро или соединение, а когда выполняется на CPU либо ждёт I/O. Модель учебная: одна база с заданной задержкой, круговое распределение запросов между процессами, без стоимости переключений и сетевых накладных расходов.</p>
    <div className="stand-presets" aria-label="Готовые сценарии"><button type="button" onClick={() => setSettings({ ...initial, computeMs: 20, databaseMs: 180 })}>Ожидание базы</button><button type="button" onClick={() => setSettings({ ...initial, computeMs: 200, databaseMs: 40 })}>Тяжёлый расчёт</button><button type="button" onClick={() => setSettings({ ...initial, computeMs: 200, databaseMs: 40, offloadCompute: true, cores: 4, processes: 2 })}>Рабочие потоки и ядра</button></div>
    <div className="stand-settings">
      <div><h3>Поток запросов</h3><Setting label="Запросов" value={settings.requests} min={2} max={12} onChange={value => change("requests", value)} /><Setting label="Интервал прихода" value={settings.arrivalInterval} min={0} max={80} step={5} unit=" мс" onChange={value => change("arrivalInterval", value)} /></div>
      <div><h3>Приложение и CPU</h3><Setting label="Физических ядер" value={settings.cores} min={1} max={8} onChange={value => change("cores", value)} /><Setting label="Процессов" value={settings.processes} min={1} max={4} onChange={value => change("processes", value)} /><Setting label="Разбор запроса" value={settings.prepareMs} min={5} max={60} step={5} unit=" мс CPU" onChange={value => change("prepareMs", value)} /><Setting label="Тяжёлый расчёт" value={settings.computeMs} min={20} max={300} step={10} unit=" мс CPU" onChange={value => change("computeMs", value)} /></div>
      <div><h3>База и потоки</h3><Setting label="Пул на процесс" value={settings.poolPerProcess} min={1} max={6} onChange={value => change("poolPerProcess", value)} /><Setting label="Ожидание базы" value={settings.databaseMs} min={20} max={300} step={10} unit=" мс I/O" onChange={value => change("databaseMs", value)} /><label className="stand-checkbox"><input type="checkbox" checked={settings.offloadCompute} onChange={event => change("offloadCompute", event.target.checked)} /> Вынести тяжёлый расчёт в рабочие потоки</label>{settings.offloadCompute && <Setting label="Рабочих потоков на процесс" value={settings.workersPerProcess} min={1} max={4} onChange={value => change("workersPerProcess", value)} />}</div>
    </div>
    <SimulationView key={JSON.stringify(settings)} settings={settings} />
    <div className="stand-lessons"><h3>Как читать результат</h3><ul><li><strong>Процесс</strong> хранит собственную память и собственный пул. Увеличение числа процессов также увеличивает суммарное число соединений к базе.</li><li><strong>Поток</strong> выполняет инструкции. Рабочий поток освобождает главный цикл, но использует те же физические ядра.</li><li><strong>CPU и I/O</strong> — разные этапы. Асинхронное ожидание базы не занимает ядро приложения; тяжёлый расчёт занимает.</li><li><strong>Пул</strong> ограничивает одновременные обращения к базе. Полный пул создаёт ожидание даже при свободном CPU.</li></ul></div>
  </section>;
}
