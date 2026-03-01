export type HttpMethod = "GET" | "POST" | "PUT";

export async function httpGet<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  return res.json() as Promise<T>;
}

export async function httpPost<T, B = unknown>(
  url: string,
  body: B,
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Failed to POST ${url}`);
  }

  return res.json() as Promise<T>;
}

export async function httpPut<T, B = unknown>(
  url: string,
  body: B,
): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Failed to PUT ${url}`);
  }

  return res.json() as Promise<T>;
}
