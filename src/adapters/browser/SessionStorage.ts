import { WebStorage } from './WebStorage.js'

export class SessionStorage<T> extends WebStorage<T> {
  constructor(key: string) {
    super(key, sessionStorage)
  }
}
