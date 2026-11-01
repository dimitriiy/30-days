"use client";

import { useMemo } from "react";
import { ReactFlow, Background, Controls, Handle, MarkerType, Position, useNodesState, type Edge, type Node, type NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { SegmentKind, SimulatedRequest, SimulationSettings } from "./simulation";
import "./request-flow.css";

type FlowData = { label: string; detail?: string; note?: string; active?: boolean; busy?: number; capacity?: number };
type FlowNode = Node<FlowData>;

function DetailNode({ data }: NodeProps<FlowNode>) {
  return <div className={`flow-detail-node ${data.active ? "is-active" : ""}`}>
    <Handle type="target" position={Position.Left} isConnectable={false} />
    <strong>{data.label}</strong><p>{data.detail}</p>
    {data.capacity !== undefined && <div className="flow-slots" aria-label={`Занято ${data.busy} из ${data.capacity} мест пула`}>{Array.from({ length: data.capacity }, (_, i) => <i key={i} className={i < (data.busy ?? 0) ? "is-busy" : ""} />)}</div>}
    {data.note && <small>{data.note}</small>}
    <Handle type="source" position={Position.Right} isConnectable={false} />
  </div>;
}
function ProcessBoundary({ data }: NodeProps<FlowNode>) {
  return <div className="flow-process-boundary"><strong>{data.label}</strong></div>;
}
const nodeTypes = { detail: DetailNode, boundary: ProcessBoundary };

function createNodes(settings: SimulationSettings, process: number): FlowNode[] {
  return [
    { id: "client", type: "detail", position: { x: 0, y: 155 }, data: { label: "1 · Клиент", detail: "Отправляет HTTP-запрос. Он назначается одному процессу приложения.", note: `${settings.requests} запросов в модели` } },
    { id: "boundary", type: "boundary", position: { x: 260, y: 20 }, style: { width: 650, height: 430 }, data: { label: `ПРОЦЕСС ${process + 1} · отдельная память и собственные ресурсы` }, draggable: true },
    { id: "main", type: "detail", parentId: "boundary", position: { x: 24, y: 65 }, data: { label: "2 · Главный поток", detail: "Разбирает запрос, запускает чтение и формирует ответ. Исполняет один участок JS за раз.", note: "Долгий синхронный расчёт задерживает другие обработчики." } },
    { id: "worker", type: "detail", parentId: "boundary", position: { x: 345, y: 65 }, data: { label: "Рабочие потоки", detail: settings.offloadCompute ? `${settings.workersPerProcess} потоков получают тяжёлые задачи отдельно от главного.` : "Выключены: тяжёлый расчёт выполняется в главном потоке.", note: "Node.js workers имеют отдельные JS-контексты; память можно разделить явно." } },
    { id: "queue", type: "detail", parentId: "boundary", position: { x: 24, y: 250 }, data: { label: "3 · Очередь пула", detail: "Если свободного соединения нет, запрос ждёт здесь.", note: "Ожидание увеличивает время ответа и удерживает состояние запроса." } },
    { id: "pool", type: "detail", parentId: "boundary", position: { x: 345, y: 250 }, data: { label: "4 · Пул соединений", detail: "Переиспользуемые соединения с базой. Ответ получен → место освобождается.", capacity: settings.poolPerProcess, busy: 0, note: "Пустая ячейка — свободная ёмкость, не обязательно открытый сокет." } },
    { id: "database", type: "detail", position: { x: 980, y: 245 }, data: { label: "5 · База / I/O", detail: `Соединение занято ${settings.databaseMs} мс, пока запрос ждёт ответ базы.`, note: "У базы свои CPU, память, диск и лимит подключений; в модели они объединены в задержку." } },
    { id: "cpu", type: "detail", position: { x: 980, y: 20 }, data: { label: "CPU сервера приложения", detail: `${settings.cores} физических ядер делят потоки всех процессов.`, note: "На одном ядре потоки чередуются; дополнительные потоки не создают новые ядра." } },
  ];
}

function DiagramCanvas({ settings, stage, process, requests, cursor }: { settings: SimulationSettings; stage: SegmentKind | undefined; process: number; requests: SimulatedRequest[]; cursor: number }) {
  const initial = useMemo(() => createNodes(settings, process), [settings, process]);
  const [layout, , onNodesChange] = useNodesState<FlowNode>(initial);
  const local = requests.filter(request => request.process === process);
  const count = (kind: SegmentKind) => local.filter(request => request.segments.some(segment => segment.kind === kind && segment.start <= cursor && cursor < segment.end)).length;
  const busy = count("database");
  const waiting = count("db-wait");
  const active = (id: string) => (id === "main" && (stage === "prepare" || stage === "finish" || (stage === "compute" && !settings.offloadCompute))) || (id === "worker" && stage === "compute" && settings.offloadCompute) || (id === "queue" && stage === "db-wait") || ((id === "pool" || id === "database") && stage === "database") || (id === "cpu" && (stage === "prepare" || stage === "compute" || stage === "finish"));
  const nodes = layout.map(node => ({ ...node, data: { ...node.data, active: active(node.id), ...(node.id === "pool" ? { busy, note: `Занято ${busy} из ${settings.poolPerProcess}. Ограничение задаётся на каждый процесс.` } : {}), ...(node.id === "queue" ? { detail: `Сейчас ждут: ${waiting}. Когда пул заполнен, следующий запрос встаёт в очередь.` } : {}) } }));
  const edge = (id: string, source: string, target: string, label: string, highlighted = false): Edge => ({ id, source, target, label, animated: highlighted, type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: highlighted ? "#2155b5" : "#8298b7", strokeWidth: highlighted ? 3 : 1.6 }, labelStyle: { fill: "#344d70", fontSize: 12, fontWeight: 700 } });
  const edges = [edge("incoming", "client", "main", "HTTP"), edge("waiting", "main", "queue", "нужно соединение", stage === "db-wait"), edge("take", "queue", "pool", "выдать место", stage === "database"), edge("sql", "pool", "database", "SQL → ответ", stage === "database"), edge("task", "main", "worker", "тяжёлая задача", stage === "compute" && settings.offloadCompute), edge("cpu-main", "main", "cpu", "инструкции", active("main")), edge("cpu-worker", "worker", "cpu", "инструкции", active("worker"))];
  return <div className="flow-canvas" aria-label="Схема процесса, потоков, очереди и пула"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} nodesConnectable={false} fitView fitViewOptions={{ padding: 0.1, maxZoom: 1 }} minZoom={0.3} maxZoom={2}><Background color="#dce5f1" gap={20} /><Controls showInteractive={false} /></ReactFlow></div>;
}

export function RequestFlowDiagram({ settings, stage, process, requests, cursor }: { settings: SimulationSettings; stage: SegmentKind | undefined; process: number; requests: SimulatedRequest[]; cursor: number }) {
  return <section className="flow-sandbox" aria-labelledby="sandbox-title">
    <div className="course-eyebrow">Интерактивная схема · React Flow</div><h3 id="sandbox-title">Путь запроса внутри процесса</h3>
    <p>На схеме показан процесс выбранного запроса. Выбери другую строку на шкале ниже, чтобы увидеть её процесс. Передвигай узлы и увеличивай схему; подсветка и счётчики следуют за временем.</p>
    <DiagramCanvas key={process} settings={settings} stage={stage} process={process} requests={requests} cursor={cursor} />
    <p className="flow-footnote">Пул настраивается на каждый процесс: {settings.processes} × {settings.poolPerProcess} = до {settings.processes * settings.poolPerProcess} одновременных соединений в модели. Реальный размер дополнительно ограничен возможностями базы, памятью и другими клиентами. Большой пул может перегрузить базу, маленький — увеличить очередь. Модель не учитывает установку соединений, лимит базы и накладные расходы переключений.</p>
  </section>;
}
