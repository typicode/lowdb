import { LowSync } from '../src/index.js'
import { JSONFileSync } from '../src/node.js'

type Data = {
  messages: string[]
}

const message = process.argv[2] || ''
const defaultData: Data = { messages: [] }
const adapter = new JSONFileSync<Data>('file.json')
const db = new LowSync<Data>(adapter, defaultData)

db.read()

db.data.messages.push(message)

db.write()
