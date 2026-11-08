type Cell = string | number | boolean | Date | null;
type GoRuntime = {
  importObject: WebAssembly.Imports;
  run(instance: WebAssembly.Instance): Promise<void>;
};
type WasmWindow = Window & {
  Go: new () => GoRuntime;
  parseFinanceFile: (bytes: Uint8Array, format: "xlsx" | "csv") => string;
};

let ready: Promise<void> | undefined;

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/finance-wasm-exec.js";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Не удалось загрузить среду WebAssembly"));
    document.head.appendChild(script);
  });
}

function loadWasm(): Promise<void> {
  if (!ready)
    ready = (async () => {
      await loadScript();
      const response = await fetch("/finance-parser.wasm");
      if (!response.ok) throw new Error("Не удалось загрузить WASM-парсер");
      const go = new (window as unknown as WasmWindow).Go();
      const binary = await response.arrayBuffer();
      const { instance } = await WebAssembly.instantiate(
        binary,
        go.importObject,
      );
      void go.run(instance);
      for (let attempt = 0; attempt < 100; attempt++) {
        if (
          typeof (window as unknown as WasmWindow).parseFinanceFile ===
          "function"
        )
          return;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      throw new Error("WASM-парсер не запустился");
    })().catch((error: unknown) => {
      ready = undefined;
      throw error;
    });
  return ready;
}

export async function readBankFile(file: File): Promise<Cell[][]> {
  await loadWasm();
  const format = file.name.toLowerCase().endsWith(".csv") ? "csv" : "xlsx";
  let bytes = new Uint8Array(await file.arrayBuffer());
  if (format === "csv") {
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      bytes = new TextEncoder().encode(
        new TextDecoder("windows-1251").decode(bytes),
      );
    }
  }
  const result = JSON.parse(
    (window as unknown as WasmWindow).parseFinanceFile(bytes, format),
  ) as { rows?: Cell[][]; error?: string };
  if (result.error) throw new Error(result.error);
  if (!result.rows) throw new Error("Не удалось прочитать таблицу");
  return result.rows;
}
