export type SimulationSettings = {
  requests: number;
  arrivalInterval: number;
  cores: number;
  processes: number;
  poolPerProcess: number;
  workersPerProcess: number;
  prepareMs: number;
  databaseMs: number;
  computeMs: number;
  offloadCompute: boolean;
};

export type SegmentKind = "cpu-wait" | "prepare" | "db-wait" | "database" | "compute" | "finish";
export type Segment = { kind: SegmentKind; start: number; end: number };
export type SimulatedRequest = { id: number; process: number; arrival: number; done: number; segments: Segment[] };
export type SimulationResult = {
  requests: SimulatedRequest[];
  makespan: number;
  averageMs: number;
  p95Ms: number;
  cpuUtilization: number;
  peakConnections: number;
  peakDatabaseQueue: number;
  averageDatabaseWait: number;
};

type TaskKind = "prepare" | "compute" | "finish";
type CpuTask = { request: SimulatedRequest; kind: TaskKind; readyAt: number; start: number; remaining: number };
type DatabaseTask = { request: SimulatedRequest; queuedAt: number; start: number; remaining: number };
type ProcessState = {
  loop: CpuTask | null;
  loopQueue: CpuTask[];
  workers: (CpuTask | null)[];
  workerQueue: CpuTask[];
  database: DatabaseTask[];
  databaseQueue: DatabaseTask[];
};

function addSegment(request: SimulatedRequest, kind: SegmentKind, start: number, end: number) {
  if (end > start) request.segments.push({ kind, start, end });
}

function makeTask(request: SimulatedRequest, kind: TaskKind, readyAt: number, settings: SimulationSettings): CpuTask {
  const remaining = kind === "prepare" ? settings.prepareMs : kind === "compute" ? settings.computeMs : 5;
  return { request, kind, readyAt, start: -1, remaining };
}

export function simulate(settings: SimulationSettings): SimulationResult {
  const processes: ProcessState[] = Array.from({ length: settings.processes }, () => ({
    loop: null,
    loopQueue: [],
    workers: Array.from({ length: settings.workersPerProcess }, () => null),
    workerQueue: [],
    database: [],
    databaseQueue: [],
  }));
  const requests: SimulatedRequest[] = Array.from({ length: settings.requests }, (_, id) => ({
    id: id + 1,
    process: id % settings.processes,
    arrival: id * settings.arrivalInterval,
    done: -1,
    segments: [],
  }));
  let nextArrival = 0;
  let complete = 0;
  let cpuTicks = 0;
  let peakConnections = 0;
  let peakDatabaseQueue = 0;
  let databaseWait = 0;
  let turn = 0;
  let time = 0;

  for (; time < 20000 && complete < requests.length; time++) {
    while (nextArrival < requests.length && requests[nextArrival].arrival === time) {
      const request = requests[nextArrival++];
      processes[request.process].loopQueue.push(makeTask(request, "prepare", time, settings));
    }

    for (const process of processes) {
      while (process.database.length < settings.poolPerProcess && process.databaseQueue.length) {
        const task = process.databaseQueue.shift()!;
        task.start = time;
        databaseWait += time - task.queuedAt;
        addSegment(task.request, "db-wait", task.queuedAt, time);
        process.database.push(task);
      }
      if (!process.loop && process.loopQueue.length) {
        process.loop = process.loopQueue.shift()!;
        process.loop.start = time;
        addSegment(process.loop.request, "cpu-wait", process.loop.readyAt, time);
      }
      for (let worker = 0; worker < process.workers.length; worker++) {
        if (!process.workers[worker] && process.workerQueue.length) {
          process.workers[worker] = process.workerQueue.shift()!;
          const task = process.workers[worker]!;
          task.start = time;
          addSegment(task.request, "cpu-wait", task.readyAt, time);
        }
      }
    }

    const running = processes.flatMap(process => [process.loop, ...process.workers].filter((task): task is CpuTask => task !== null));
    const selected: CpuTask[] = [];
    for (let core = 0; core < Math.min(settings.cores, running.length); core++) {
      selected.push(running[(turn + core) % running.length]);
    }
    if (running.length) turn = (turn + selected.length) % running.length;
    cpuTicks += selected.length;

    for (const task of selected) task.remaining--;
    for (const process of processes) {
      const active = [process.loop, ...process.workers];
      for (const task of active) {
        if (!task || task.remaining > 0) continue;
        addSegment(task.request, task.kind, task.start, time + 1);
        if (task.kind === "prepare") {
          process.databaseQueue.push({ request: task.request, queuedAt: time + 1, start: -1, remaining: settings.databaseMs });
        } else if (task.kind === "compute") {
          process.loopQueue.push(makeTask(task.request, "finish", time + 1, settings));
        } else {
          task.request.done = time + 1;
          complete++;
        }
        if (process.loop === task) process.loop = null;
        else process.workers[process.workers.indexOf(task)] = null;
      }

      for (let index = process.database.length - 1; index >= 0; index--) {
        const task = process.database[index];
        task.remaining--;
        if (task.remaining > 0) continue;
        addSegment(task.request, "database", task.start, time + 1);
        const compute = makeTask(task.request, "compute", time + 1, settings);
        if (settings.offloadCompute) process.workerQueue.push(compute);
        else process.loopQueue.push(compute);
        process.database.splice(index, 1);
      }
    }
    peakConnections = Math.max(peakConnections, processes.reduce((sum, process) => sum + process.database.length, 0));
    peakDatabaseQueue = Math.max(peakDatabaseQueue, processes.reduce((sum, process) => sum + process.databaseQueue.length, 0));
  }

  if (complete !== requests.length) throw new Error("Симуляция превысила допустимое время");
  const latencies = requests.map(request => request.done - request.arrival).sort((a, b) => a - b);
  return {
    requests,
    makespan: time,
    averageMs: Math.round(latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length),
    p95Ms: latencies[Math.ceil(latencies.length * 0.95) - 1],
    cpuUtilization: Math.round(cpuTicks / (time * settings.cores) * 100),
    peakConnections,
    peakDatabaseQueue,
    averageDatabaseWait: Math.round(databaseWait / requests.length),
  };
}
