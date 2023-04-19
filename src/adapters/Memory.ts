import { Adapter, SyncAdapter } from '../core/Low.js'

export class Memory<T> implements Adapter<T> {
  #data: T | null = null

  read(): Promise<T | null> {
    return Promise.resolve(this.#data)
  }

  write(obj: T): Promise<void> {
    this.#data = obj
    return Promise.resolve()
  }
}

export class MemorySync<T> implements SyncAdapter<T> {
  #data: T | null = null

  read(): T | null {
    return this.#data || null
  }

  write(obj: T): void {
    this.#data = obj
  }
}
