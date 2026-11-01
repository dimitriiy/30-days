const key = "system-design-monolith-summary";
const event = "monolith-summary-change";
let fallback = "[]";
let storageUnavailable = false;

export function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(event, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(event, callback);
  };
}

export function getSnapshot(): string {
  if (storageUnavailable) return fallback;
  try { return localStorage.getItem(key) ?? "[]"; } catch { return fallback; }
}

export function saveSelection(ids: string[]): boolean {
  const value = JSON.stringify(ids);
  fallback = value;
  let saved = true;
  try { localStorage.setItem(key, value); storageUnavailable = false; } catch { storageUnavailable = true; saved = false; }
  window.dispatchEvent(new Event(event));
  return saved;
}

export function parseSelection(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch { return []; }
}
