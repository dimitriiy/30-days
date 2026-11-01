"use client";

import { useState, type ReactNode } from "react";

function Range({ label, value, min, max, step = 1, unit = "", onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (value: number) => void;
}) {
  return <label>{label}: <output>{value.toLocaleString("ru-RU")}{unit}</output><input type="range" min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value))} /></label>;
}

function Lab({ title, hint, children, result }: { title: string; hint: string; children: ReactNode; result: ReactNode }) {
  return <section className="course-lab" id="course-lab" aria-label={title}>
    <div className="course-eyebrow">Интерактивная модель · меняй условия</div>
    <h3>{title}</h3>
    <p>{hint}</p>
    <div className="course-controls">{children}</div>
    <div className="course-result" aria-live="polite">{result}</div>
  </section>;
}

function LoadLab() {
  const [users, setUsers] = useState(20000);
  const [interval, setInterval] = useState(10);
  return <Lab title="Сколько запросов создаёт одно действие?" hint="Представь пользователей, которые регулярно обновляют список. Меняй их число и интервал опроса."
    result={<><strong>{Math.round(users / interval).toLocaleString("ru-RU")} чтений/с.</strong> Даже если один пользователь создаёт мало запросов, массовое регулярное действие быстро превращается в большой поток.</>}>
    <Range label="Активных пользователей" value={users} min={1000} max={50000} step={1000} onChange={setUsers} />
    <Range label="Один запрос каждые" value={interval} min={1} max={60} unit=" с" onChange={setInterval} />
  </Lab>;
}

function RequestPathLab() {
  const [database, setDatabase] = useState(80);
  const [external, setExternal] = useState(200);
  const [wait, setWait] = useState(true);
  return <Lab title="Собери время ответа" hint="Проверка запроса и формирование ответа занимают по 10 мс. Внешнее действие можно выполнить до ответа или после фиксации данных."
    result={<><strong>{20 + database + (wait ? external : 0)} мс до ответа.</strong> {wait ? "Клиент ждёт внешний сервис." : "Клиент не ждёт внешний сервис; его успех нужно отслеживать отдельно."}</>}>
    <Range label="База" value={database} min={10} max={300} step={10} unit=" мс" onChange={setDatabase} />
    <Range label="Внешний сервис" value={external} min={0} max={500} step={10} unit=" мс" onChange={setExternal} />
    <label className="course-switch"><input type="checkbox" checked={wait} onChange={event => setWait(event.target.checked)} /> Ждать внешний сервис перед ответом</label>
  </Lab>;
}

function RaceLab() {
  const [safe, setSafe] = useState(false);
  return <Lab title="Два запроса пришли одновременно" hint="Оба увидели статус «создан». Выбери способ записи и посмотри, сколько запросов смогут перевести запись в «оплачен»."
    result={<><strong>{safe ? "Один переход." : "Возможны две оплаты."}</strong> {safe ? "Условие status = 'created' проверяется атомарно при записи; второй UPDATE изменит 0 строк." : "Оба запроса прошли предварительную проверку и затем выполняют действие."}</>}>
    <div className="course-choice-buttons"><button type="button" className={!safe ? "is-selected" : ""} onClick={() => setSafe(false)}>Проверить, потом записать</button><button type="button" className={safe ? "is-selected" : ""} onClick={() => setSafe(true)}>Условный UPDATE</button></div>
  </Lab>;
}

function IndexLab() {
  const [rows, setRows] = useState(100000);
  const [indexed, setIndexed] = useState(false);
  return <Lab title="Сколько записей придётся просмотреть?" hint="Упрощённая модель поиска последних 20 записей одного пользователя. Точные планы и число страниц зависят от данных."
    result={indexed ? <><strong>Переход по B-tree и чтение нужного диапазона.</strong> Число реально прочитанных страниц покажет EXPLAIN ANALYZE; оно зависит от распределения данных и состояния таблицы.</> : <><strong>Потенциально до {rows.toLocaleString("ru-RU")} строк.</strong> Без подходящего индекса работа полного просмотра растёт вместе с таблицей.</>}>
    <Range label="Строк в таблице" value={rows} min={1000} max={1000000} step={1000} onChange={setRows} />
    <label className="course-switch"><input type="checkbox" checked={indexed} onChange={event => setIndexed(event.target.checked)} /> Индекс под фильтр и сортировку</label>
  </Lab>;
}

function AmdahlLab() {
  const [serial, setSerial] = useState(10);
  const [cores, setCores] = useState(4);
  const duration = 1000 * (serial / 100 + (1 - serial / 100) / cores);
  return <Lab title="Сколько дадут новые ядра?" hint="На одном ядре задача длится 1 секунду. Независимую часть делим между ядрами без накладных расходов."
    result={<><strong>{Math.round(duration)} мс; ускорение {(1000 / duration).toFixed(1)}×.</strong> Последовательная часть всё ещё занимает {serial * 10} мс.</>}>
    <Range label="Последовательная часть" value={serial} min={0} max={90} unit="%" onChange={setSerial} />
    <Range label="Физических ядер" value={cores} min={1} max={32} onChange={setCores} />
  </Lab>;
}

function ProcessLab() {
  const [shared, setShared] = useState(false);
  const [value, setValue] = useState(8);
  return <Lab title="Кто видит изменение памяти?" hint="Два исполнителя начинают с числа 8. Модель потоков здесь предполагает явно общий объект; у Node.js worker_threads обычные JS-объекты так не разделяются."
    result={<div className="course-memory"><span>Исполнитель A <strong>{value}</strong></span><span>Исполнитель B <strong>{shared ? value : 8}</strong></span><small>{shared ? "Потоки одного процесса работают с общим объектом в этой модели." : "Процессы имеют отдельную память; B остался со своей копией."}</small></div>}>
    <div className="course-choice-buttons"><button type="button" className={!shared ? "is-selected" : ""} onClick={() => setShared(false)}>Два процесса</button><button type="button" className={shared ? "is-selected" : ""} onClick={() => setShared(true)}>Два потока</button></div>
    <button type="button" className="course-lab-button" onClick={() => setValue(previous => previous + 1)}>Изменить у A: +1</button>
  </Lab>;
}

function EventLoopLab() {
  const [asyncWait, setAsyncWait] = useState(true);
  const [rate, setRate] = useState(500);
  const [latency, setLatency] = useState(200);
  const requests = rate * latency / 1000;
  return <Lab title="Когда начнётся второй запрос?" hint="A стартует в 0 мс и занимает 40 мс. B становится готов в 5 мс. Переключи тип работы A."
    result={<><strong>B начнётся в {asyncWait ? 5 : 40} мс.</strong> {asyncWait ? "A ждёт ввод-вывод асинхронно, поэтому поток свободен." : "A непрерывно считает или блокирует поток; B ждёт возврата управления."}<div className="course-mini-result">При {rate}/с и {latency} мс в работе около {Math.round(requests)} запросов, занято примерно {(requests * 20 / 1000).toFixed(1)} МБ их состояния.</div></>}>
    <div className="course-choice-buttons"><button type="button" className={asyncWait ? "is-selected" : ""} onClick={() => setAsyncWait(true)}>A ждёт асинхронно</button><button type="button" className={!asyncWait ? "is-selected" : ""} onClick={() => setAsyncWait(false)}>A блокирует поток</button></div>
    <Range label="Входящий поток" value={rate} min={100} max={5000} step={100} unit="/с" onChange={setRate} />
    <Range label="Время ответа" value={latency} min={20} max={2000} step={20} unit=" мс" onChange={setLatency} />
  </Lab>;
}

function QueueLab() {
  const [arrivals, setArrivals] = useState(500);
  const [capacity, setCapacity] = useState(100);
  return <Lab title="Как быстро растёт очередь?" hint="Модель для пяти секунд без отказов и без ограничения очереди. Если приходят быстрее, чем выполняются, ожидание накапливается."
    result={<><strong>{Math.max(0, arrivals - capacity) * 5} запросов</strong> окажутся в очереди через 5 секунд. {arrivals > capacity ? "Нужны лимит ожидания и управление перегрузкой." : "Система успевает обслуживать поток."}</>}>
    <Range label="Приходит" value={arrivals} min={50} max={1000} step={50} unit="/с" onChange={setArrivals} />
    <Range label="Обрабатывается" value={capacity} min={50} max={1000} step={50} unit="/с" onChange={setCapacity} />
  </Lab>;
}

function PoolLab() {
  const [connections, setConnections] = useState(20);
  const [duration, setDuration] = useState(10);
  const capacity = Math.round(connections * 1000 / duration);
  return <Lab title="Что сделает медленная зависимость с пулом?" hint="Каждый запрос занимает одно соединение. Меняй длительность операции и размер пула."
    result={<><strong>Предел около {capacity.toLocaleString("ru-RU")} операций/с.</strong> При 500 входящих/с {capacity < 500 ? `очередь растёт примерно на ${500 - capacity}/с.` : "пул успевает без очереди в этой модели."}</>}>
    <Range label="Соединений в пуле" value={connections} min={5} max={100} step={5} onChange={setConnections} />
    <Range label="Занятость соединения" value={duration} min={10} max={500} step={10} unit=" мс" onChange={setDuration} />
  </Lab>;
}

function CacheLab() {
  const [hit, setHit] = useState(80);
  const [requests, setRequests] = useState(1000);
  const [available, setAvailable] = useState(true);
  const database = available ? Math.round(requests * (1 - hit / 100)) : requests;
  return <Lab title="Сколько чтений останется базе?" hint="Кэш хранит восстанавливаемые результаты. Попробуй изменить долю попаданий и отключить кэш."
    result={<><strong>{database.toLocaleString("ru-RU")} чтений/с идёт в базу.</strong> {available ? "При промахе база всё равно выполняет чтение." : "После отказа кэша весь поток снова идёт в базу."}</>}>
    <Range label="Запросов" value={requests} min={100} max={5000} step={100} unit="/с" onChange={setRequests} />
    <Range label="Попаданий в кэш" value={hit} min={0} max={100} step={5} unit="%" onChange={setHit} />
    <label className="course-switch"><input type="checkbox" checked={available} onChange={event => setAvailable(event.target.checked)} /> Кэш доступен</label>
  </Lab>;
}

function RecoveryLab() {
  const [detect, setDetect] = useState(10);
  const [restore, setRestore] = useState(15);
  const [verify, setVerify] = useState(5);
  return <Lab title="Сколько длится восстановление на самом деле?" hint="RTO включает все этапы до проверенной работы API. Сократи один этап и посмотри, сколько времени сэкономлено."
    result={<><strong>Полный простой: {detect + restore + verify} минут.</strong> Копирование данных занимает только {restore} минут из этого времени.</>}>
    <Range label="Обнаружить и подготовить" value={detect} min={0} max={60} unit=" мин" onChange={setDetect} />
    <Range label="Восстановить данные" value={restore} min={1} max={120} unit=" мин" onChange={setRestore} />
    <Range label="Проверить и вернуть трафик" value={verify} min={0} max={60} unit=" мин" onChange={setVerify} />
  </Lab>;
}

export function CourseLab({ lessonIndex }: { lessonIndex: number }) {
  const labs = [LoadLab, RequestPathLab, RaceLab, IndexLab, AmdahlLab, ProcessLab, EventLoopLab, QueueLab, PoolLab, CacheLab, RecoveryLab];
  const SelectedLab = labs[lessonIndex];
  return <SelectedLab />;
}
