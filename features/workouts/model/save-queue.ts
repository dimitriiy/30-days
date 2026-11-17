export function enqueueSave<T>(pending: Promise<unknown>, save: () => Promise<T>): Promise<T> {
  return pending.catch(() => {}).then(save);
}
