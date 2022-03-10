import { SyncAdapter } from '../LowSync.js'

export class LocalStorage<T> implements SyncAdapter<T> {
  #key: string

  constructor(key: string) {
    this.#key = key
  }

  read(): T | null {
    const value = global.localStorage.getItem(this.#key)

    if (value === null) {
      return null
    }

    return JSON.parse(value) as T
  }

  write(obj: T): void {
    global.localStorage.setItem(this.#key, JSON.stringify(obj))
  }
}
