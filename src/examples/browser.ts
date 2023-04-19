import { LocalStorage } from '../browser.js'
import { LowSync } from '../index.js'

type Data = {
  messages: string[]
}
const adapter = new LocalStorage<Data>('db')
const db = new LowSync<Data>(adapter, { messages: [] })

db.read()
db.data.messages.push('foo')

db.write()
