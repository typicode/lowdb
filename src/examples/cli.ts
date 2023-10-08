import { JSONSyncPreset } from '../presets/JSONPreset.js'

type Data = {
  messages: string[]
}

const message = process.argv[2] || ''
const defaultData: Data = { messages: [] }
const db = JSONSyncPreset('file.json', defaultData)

db.data.messages.push(message)

db.write()
