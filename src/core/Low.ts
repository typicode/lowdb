export interface Adapter<T> {
  read: () => Promise<T | null>
  write: (data: T) => Promise<void>
}

export interface SyncAdapter<T> {
  read: () => T | null
  write: (data: T) => void
}

function checkArgs(adapter: unknown, defaultData: unknown) {
  if (adapter === undefined) throw new Error('lowdb: missing adapter')
  if (defaultData === undefined) throw new Error('lowdb: missing default data')
}

export class Low<T = unknown> {
  adapter: Adapter<T>
  data: T

  constructor(adapter: Adapter<T>, defaultData: T) {
    checkArgs(adapter, defaultData)
    this.adapter = adapter
    this.data = defaultData
  }

  async read(): Promise<void> {
    const data = await this.adapter.read()
    if (data) this.data = data
  }

  async write(): Promise<void> {
    if (this.data) await this.adapter.write(this.data)
  }

  async update(fn: (data: T) => unknown): Promise<void> {
    fn(this.data)
    await this.write()
  }
}

export class LowSync<T = unknown> {
  adapter: SyncAdapter<T>
  data: T

  constructor(adapter: SyncAdapter<T>, defaultData: T) {
    checkArgs(adapter, defaultData)
    this.adapter = adapter
    this.data = defaultData
  }

  read(): void {
    const data = this.adapter.read()
    if (data) this.data = data
  }

  write(): void {
    if (this.data) this.adapter.write(this.data)
  }

  update(fn: (data: T) => unknown): void {
    fn(this.data)
    this.write()
  }
}
