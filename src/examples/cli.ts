import { JSONSyncPreset } from '../presets/node.js'

type Data = {
  messages: string[]
}

const message = process.argv[2] || ''

const defaultData: Data = { messages: [] }
const db = JSONSyncPreset<Data>('file.json', defaultData)

db.update(({ messages }) => messages.push(message))
