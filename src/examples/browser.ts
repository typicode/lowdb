import { LocalStoragePreset } from '../presets/browser.js'

type Data = {
  messages: string[]
}

const defaultData: Data = { messages: [] }
const db = LocalStoragePreset<Data>('db', defaultData)

db.data.messages.push('foo')

db.write()
