import { SyncAdapter } from '../LowSync.js'

export class LocalStorage<T> implements SyncAdapter<T> {
  #key: string
  #localStorage: {
    getItem: (key: string) => string | null
    setItem: (key: string, data: string) => void
  }

  constructor(key: string) {
    this.#key = key

    this.#localStorage = {
      getItem: (): null => null,
      setItem: (): void => undefined,
    }

    if (typeof global !== 'undefined' && 'localStorage' in global) {
      this.#localStorage = global.localStorage
    }

    if (typeof window !== 'undefined' && 'localStorage' in window) {
      this.#localStorage = window.localStorage
    }
  }

  read(): T | null {
    const value = this.#localStorage.getItem(this.#key)

    if (value === null) {
      return null
    }

    return JSON.parse(value) as T
  }

  write(obj: T): void {
    this.#localStorage.setItem(this.#key, JSON.stringify(obj))
  }
}
