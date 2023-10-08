import { WebStoragePreset } from '../presets/WebStoragePreset.js'

type Data = {
  messages: string[]
}

const defaultData: Data = { messages: [] }
const db = WebStoragePreset<Data>('db', defaultData)

db.data.messages.push('foo')

db.write()
