import { Adapter } from '../Low'

export class Memory<T> implements Adapter<T> {
  private data: T | null = null

  read(): Promise<T | null> {
    return Promise.resolve(this.data)
  }

  write(obj: T): Promise<void> {
    this.data = obj
    return Promise.resolve()
  }
}
