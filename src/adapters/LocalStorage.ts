import { ISyncAdapter } from '../LowSync'

export default class LocalStorage implements ISyncAdapter {
  public key: string

  constructor(key: string) {
    this.key = key
  }

  public read() {
    const value = localStorage.getItem(this.key)

    if (value === null) {
      return null
    }

    return JSON.parse(value)
  }

  public write(data: any) {
    localStorage.setItem(this.key, JSON.stringify(data))
  }
}
