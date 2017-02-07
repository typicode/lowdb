# Examples

## CLI

```js
// cli.js
const low = require('lowdb')
const db = low('db.json')

db.defaults({ posts: [] })
  .value()

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
const db = low('db')

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
const fileAsync = require('lowdb/lib/storages/file-async')

// Create server
const app = express()

// Start database using file-async storage
const db = low('db.json', {
  storage: fileAsync
})

// Routes
// GET /posts/:id
app.get('/posts/:id', (req, res) => {
  db.get('posts')
    .find({ id: req.params.id })
    .write()
    .then(post => res.send(post))
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

// Init
db.defaults({ posts: [] })
  .write()
  .then(() => {
    app.listen(3000, () => console.log('Server is listening')
  })
```

Using ES7 `async/await` and [Babel](https://babeljs.io/), you can write:

```js
app.get('/posts/:id', async (req, res) => {
  const post = await db.get('posts')
    .find({ id: req.params.id })
    .write()

  res.send(post)
})


## In-memory

In this mode, no storage is used. Everything is done in memory.

You can still persist data but you'll have to do it yourself. Here's an example:

```js
const fs = require('fs')
const db = low()

db.defaults({ posts: [] })
  .write()

db.get('posts')
  .push({ title: 'lowdb' })
  .write()

// Manual writing
fs.writeFileSync('db.json', JSON.stringify(db.getState()))
```

In this case, it's recommended to create a custom storage.
