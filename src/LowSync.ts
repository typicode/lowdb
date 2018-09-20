import { IAdapter } from './Low'

export interface ISyncAdapter {
  read: () => any
  write: (data: any) => void
}

export default class Low {
  public adapter: ISyncAdapter
  public data: any

  constructor(adapter: IAdapter) {
    this.adapter = adapter
  }

  public read() {
    this.data = this.adapter.read()
  }

  public write() {
    return this.adapter.write(this.data)
  }
}
