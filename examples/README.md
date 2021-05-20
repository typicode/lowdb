# Examples

## CLI

```js
// cli.js
import { LowSync, JSONFileSync } from 'lowdb'

const title = process.argv[2]
const adapter = new FileSync('file.json')
const db = new LowSync(adapter)

db.read()
db.data ||= { posts: [] }

db.data.posts.push({ title })

db.write()
```

```sh
$ node cli.js "hello world"
$ cat file.json
# { "posts": [ "title": "hello world" ] }
```

## Browser

```js
import { LowSync, LocalStorage } from 'lowdb'

const adapter = new LocalStorage('db')
const db = new LowSync(adapter)

db.read()
db.data ||= { posts: [] }

db.data.posts.push({ title: 'lowdb' })

db.write()
```

## Server

**Note** if you're developing a local server and don't expect to get concurrent requests, it can be easier to use `JSONFileSync` adapter.

But if you need to avoid blocking requests, you can do so by using `JSONFile` adapter.

```js
import express from 'express'
import { Low, JSONFile } from 'lowdb'

const app = express()
app.use(express.json())

const adapter = new JSONFile('db.json')
const db = new Low(adapter)
await db.read()
db.data ||= { posts: [] }

const { posts } = db.data

app.get('/posts/:id', async (req, res) => {
  const post = posts.find((p) => p.id === req.params.id)
  res.send(post)
})

app.post('/posts', async (req, res, next) => {
  const post = posts.push(req.body)
  await db.write()
  res.send(post)
})

app.listen(3000, () => {
  console.log('listening on port 3000')
})
```

## In-memory

With this adapter, calling `write` will do nothing. One use case for this adapter can be for tests.

```js
const fs = require('fs')
const low = require('lowdb/lib/LowSync')
const FileSync = require('lowdb/lib/adapters/FileSync')
const MemorySync = require('lowdb/lib/adapters/MemorySync')

const adapter =
  process.env.NODE_ENV === 'test' ? new MemorySync() : new FileSync('db.json')

const db = new LowSync(adapter)
```
