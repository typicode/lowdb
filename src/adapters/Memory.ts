import { IAdapter } from '../Low'

export default class Memory implements IAdapter {
  private data = null

  public read() {
    return Promise.resolve(this.data)
  }

  public write(data: any) {
    this.data = data
    return Promise.resolve()
  }
}
