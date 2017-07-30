# Examples

## CLI

```js
// cli.js
const low = require('lowdb')
const db = low(new FileSync('db.json'))

db.defaults({ posts: [] })
  .write()

const result = db.get('posts')
  .push({ name: process.argv[2] })
  .write()

console.log(result)
```

```sh
$ node cli.js hello
# [ { title: 'hello' } ]
```

## Browser

```js
import low from 'lowdb'
import LocalStorage from 'lowdb/adapters/Browser'

const db = low(new LocalStorage('db'))

db.defaults({ posts: [] })
  .write()

// Data is automatically saved to localStorage
db.get('posts')
  .push({ title: 'lowdb' })
  .write()
```

## Server

Please __note__ that if you're developing a local server and don't expect to get concurrent requests, it's often easier to use `file-sync` storage, which is the default.

But if you need to avoid blocking requests, you can do so by using `file-async` storage.

```js
const express = require('express')
const low = require('lowdb')
const fileAsync = require('lowdb/lib/adapters/file-async')

// Create server
const app = express()

// Routes
// GET /posts/:id
app.get('/posts/:id', (req, res) => {
  const post = db.get('posts')
    .find({ id: req.params.id })
    .value()

  res.send(post)
})

// POST /posts
app.post('/posts', (req, res) => {
  db.get('posts')
    .push(req.body)
    .last()
    .assign({ id: Date.now() })
    .write()
    .then(post => res.send(post))
})

// Start server
low(new FileAsync('db.json'))
  .then(db => db.defaults({ posts: [] }).write())
  .then(() => app.listen(3000, () => console.log('Server is listening'))
```

## In-memory

In this mode, everything is done in memory. It's useful for tests when you don't want to persist data.

```js
const fs = require('fs')
const db = low(new Memory())

db.defaults({ posts: [] })
  .write()

db.get('posts')
  .push({ title: 'lowdb' })
  .write()
```

You can still persist data but you'll have to do it yourself:

```js
// Manual writing
fs.writeFileSync('db.json', JSON.stringify(db.getState()))
```
