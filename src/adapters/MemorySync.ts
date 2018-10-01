import { ISyncAdapter } from '../LowSync'

export default class Memory implements ISyncAdapter {
  private data = null

  public read() {
    return this.data
  }

  public write(data: any) {
    this.data = data
  }
}
