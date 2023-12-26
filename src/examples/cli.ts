import { JSONFileSyncPreset } from '../presets/node.js'

type Data = {
  messages: string[]
}

const message = process.argv[2] || ''

const defaultData: Data = { messages: [] }
const db = JSONFileSyncPreset<Data>('file.json', defaultData)

db.update(({ messages }) => messages.push(message))
