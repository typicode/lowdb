import MissingAdapterError from './MissingAdapterError'

export interface IAdapter {
  read: () => Promise<any>
  write: (data: any) => Promise<void>
}

export default class Low {
  public adapter: IAdapter
  public data: any

  constructor(adapter: IAdapter) {
    if (adapter) {
      this.adapter = adapter
    } else {
      throw new MissingAdapterError()
    }
  }

  public async read() {
    this.data = await this.adapter.read()
  }

  public write() {
    return this.adapter.write(this.data)
  }
}
