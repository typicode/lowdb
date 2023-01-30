import { SyncAdapter } from '../LowSync.js'

export class WebStorage<T> implements SyncAdapter<T> {
  #key: string
  #storage: Storage

  constructor(key: string, storage: Storage) {
    this.#key = key
    this.#storage = storage
  }

  read(): T | null {
    const value = this.#storage.getItem(this.#key)

    if (value === null) {
      return null
    }

    return JSON.parse(value) as T
  }

  write(obj: T): void {
    this.#storage.setItem(this.#key, JSON.stringify(obj))
  }
}
