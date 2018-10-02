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
const Koa = require('koa')
const _ = require('koa-route')
const bodyParser = require('koa-bodyparser')

const Low = require('lowdb/lib/Low')
const JSONFile = require('lowdb/lib/adapters/JSONFile')

const app = new Koa()

app.use(bodyParser())

const adapter = new JSONFile('db.json')
const db = new Low(adapter)

(async () => {
  await db.read()

  if (db.data === null) {
    db.data = { posts: [] }
  }

  app.use(
    _.get('/posts', async ctx => {
      ctx.body = db.data.posts
    })
  )

  app.use(
    _.get('/posts/:id', async (ctx, id) => {
      const post = db.data.posts.find(post => post.id === id)
      if (!post) {
        return ctx.throw('Cannot find post with ID: ' + id, 404)
      }
      ctx.body = post
    })
  )

  app.use(
    _.post('/posts', async ctx => {
      const post = {
        id: Date.now().toString(),
        ...ctx.request.body
      }
      db.data.posts.push(post)
      await db.write()
      ctx.body = post
    })
  )

  app.listen(8080)
})()
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
