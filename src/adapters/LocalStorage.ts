import { SyncAdapter } from '../LowSync'

export class LocalStorage<T> implements SyncAdapter<T> {
  private key: string

  constructor(key: string) {
    this.key = key
  }

  read(): T | null {
    const value = localStorage.getItem(this.key)

    if (value === null) {
      return null
    }

    return JSON.parse(value) as T
  }

  write(obj: T): void {
    localStorage.setItem(this.key, JSON.stringify(obj))
  }
}
