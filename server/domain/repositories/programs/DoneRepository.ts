export interface DoneRepository {
  getIds(): Promise<number[]>;
  setAll(ids: number[]): Promise<void>;
  add(id: number): Promise<void>;
  remove(id: number): Promise<void>;
}
