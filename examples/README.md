# Examples

## CLI

```js
const LowSync = require('lowdb/lib/LowSync')
const FileSync = require('lowdb/lib/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = new LowSync(adapter)

db.read()

if (db.data === null) {
  db.data = { posts: [] }
}

db.data.posts.push({ title: process.argv[2] })
db.write()
```

```sh
$ node cli.js hello
$ cat db.json
# { "posts": [ "title": "hello" ] }
```

## Browser

```js
import LowSync from 'lowdb/lib/LowSync'
import LocalStorage from 'lowdb/lib/adapters/LocalStorage'

const adapter = new LocalStorage('db')
const db = new LowSync(adapter)

db.read()

if (db.data === null) {
  db.data = { posts: [] }
}

db.data.posts.push({ title: 'lowdb' })
db.write()
```

## Server

Please __note__ that if you're developing a local server and don't expect to get concurrent requests, it's often easier to use `file-sync` storage, which is the default.

But if you need to avoid blocking requests, you can do so by using `file-async` storage.

```js
const express = require('express')
const bodyParser = require('body-parser')
const Low = require('lowdb/lib/Low')
const JSONFile = require('lowdb/lib/adapters/JSONFile')

const app = express()
app.use(bodyParser.json())

const adapter = new FileAsync('db.json')
const db = new Low(adapter)

db.read()
  .then(() => {
    if (db.data === null) {
      db.data = { posts: [] }
    }

    // Routes
    // GET /posts/:id
    app.get('/posts/:id', (req, res) => {
      const post = db.data.posts.find(post => post.id === req.params.id })
      res.send(post)
    })

    // POST /posts
    app.post('/posts', (req, res) => {
      const post = {
        id: Date.now().toString(),
        ...req.body
      }

      db.data.posts.push(post)
      
      db.write()
        .then(() => res.send(post))
    })
  })
  .then(() => {
    app.listen(3000, () => console.log('listening on port 3000'))
  })

```

## In-memory

With this adapter, calling `write` will do nothing. One use case for this adapter can be for tests.

```js
const fs = require('fs')
const low = require('lowdb/lib/LowSync')
const FileSync = require('lowdb/lib/adapters/FileSync')
const MemorySync = require('lowdb/lib/adapters/MemorySync')

const adapter = process.env.NODE_ENV === 'test'
  ? new MemorySync()
  : new FileSync('db.json')

const db = new LowSync(adapter)
```
