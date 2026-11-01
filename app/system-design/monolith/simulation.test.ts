import assert from "node:assert/strict";
import { test } from "node:test";

import { simulate, type SimulationSettings } from "./simulation";

const settings: SimulationSettings = {
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

test("every request passes through CPU, connection pool and I/O before completion", () => {
  const result = simulate(settings);
  assert.equal(result.requests.length, settings.requests);
  assert.ok(result.cpuUtilization <= 100);
  assert.ok(result.peakConnections <= settings.poolPerProcess * settings.processes);
  for (const request of result.requests) {
    assert.ok(request.done > request.arrival);
    assert.deepEqual(request.segments.filter(segment => ["prepare", "database", "compute", "finish"].includes(segment.kind)).map(segment => segment.kind), ["prepare", "database", "compute", "finish"]);
    assert.ok(request.segments.every(segment => segment.end > segment.start));
  }
});

test("extra cores alone cannot parallelize one blocking event loop", () => {
  const oneCore = simulate(settings);
  const fourCores = simulate({ ...settings, cores: 4 });
  assert.equal(fourCores.makespan, oneCore.makespan);
});

test("workers with available cores reduce completion time for CPU-heavy requests", () => {
  const blocking = simulate(settings);
  const parallel = simulate({ ...settings, cores: 4, offloadCompute: true, processes: 2 });
  assert.ok(parallel.makespan < blocking.makespan);
  assert.ok(parallel.peakConnections <= 4);
});

test("a larger per-process pool reduces waiting when I/O dominates", () => {
  const slowDatabase = { ...settings, computeMs: 20, databaseMs: 180 };
  const smallPool = simulate(slowDatabase);
  const largePool = simulate({ ...slowDatabase, poolPerProcess: 4 });
  assert.ok(largePool.makespan < smallPool.makespan);
  assert.ok(largePool.averageDatabaseWait < smallPool.averageDatabaseWait);
});
