import { WebStorage } from '../adapters/browser/WebStorage.js'
import { LowSync } from '../index.js'

export function WebStoragePreset<Data>(
  key: string,
  defaultData: Data,
  storage: Storage = localStorage,
) {
  const adapter = new WebStorage<Data>(key, storage)
  const db = new LowSync<Data>(adapter, defaultData)
  db.read()
  return db
}
