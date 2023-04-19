import { WebStorage } from './WebStorage.js'

export class LocalStorage<T> extends WebStorage<T> {
  constructor(key: string) {
    super(key, localStorage)
  }
}
