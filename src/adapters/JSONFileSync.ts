import { SyncAdapter } from '../LowSync.js'
import { TextFileSync } from './TextFileSync.js'

export class JSONFileSync<T> implements SyncAdapter<T> {
  #adapter: TextFileSync

  constructor(filename: string) {
    this.#adapter = new TextFileSync(filename)
  }

  read(): T | null {
    const data = this.#adapter.read()
    if (data === null) {
      return null
    } else {
      return JSON.parse(data) as T
    }
  }

  write(obj: T): void {
    this.#adapter.write(JSON.stringify(obj, null, 2))
  }
}
