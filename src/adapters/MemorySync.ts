import { SyncAdapter } from '../LowSync'

export class MemorySync<T> implements SyncAdapter<T> {
  private data: T | null = null

  read(): T | null {
    return this.data || null
  }

  write(obj: T): void {
    this.data = obj
  }
}
