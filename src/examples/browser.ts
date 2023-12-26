import { LocalStoragePreset } from '../presets/browser.js'

type Data = {
  messages: string[]
}

const defaultData: Data = { messages: [] }
const db = LocalStoragePreset<Data>('db', defaultData)

db.update(({ messages }) => messages.push('foo'))
