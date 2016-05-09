# Examples

## CLI

```js
// cli.js
const low = require('lowdb')

const db = low('db.json')
const posts = db.get('posts', [])

const result = posts
  .push({ name: process.argv[2] })
  .value()

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
const posts = db.get('posts', [])

// Data is automatically saved to localStorage
posts
  .push({ title: 'lowdb' })
  .value()
```

## Server

Please __note__ that for local server with no concurrent requests, it's often easier to use lowdb with `file-sync` storage which is the default.

But if you need to avoid blocking requests, you can do so by using `file-async` storage.

```js
const express = require('express')
const low = require('lowdb')
const fileAsync = require('lowdb/lib/file-async')

// Create server
const app = express()

// Start database using file-async storage
const db = low('db.json', {
  storage: fileAsync
})

// Define posts
const posts = db.get('posts', [])

// Routes
// GET /posts/:id
app.get('/posts/:id', (req, res) => {
  const post = posts
    .find({ id: req.params.id })
    .value()

  res.send(post)
})

// POST /posts
app.post('/posts', (req, res) => {
  // Some basic id generation, use uuid ideally
  req.body.id = Date.now()

  // post will be created asynchronously in the background
  const post = posts
    .push(req.body)
    .last()
    .value()

  res.send(post)
})

app.listen(3000, () => console.log('Server is listening'))
```

In the example above, data is written asynchronously in the background. If you want to send the response only after it has been written, set `writeOnChange` to `false` and call `db.write()` manually.

```js
const db = low('db.json', {
  storage: fileAsync,
  writeOnChange: false
})

//...
app.post('/posts', (req, res) => {
  const post = posts
    .push(req.body)
    .last()
    .value()

  db.write()
    .then(() => res.send(post))
})
// ...
```

## In-memory

In this mode, no storage is used. Everything is done in memory.

You can still persist data but you'll have to do it yourself. Here's an example:

```js
const fs = require('fs')
const db = low()

db.get('posts', [])
  .push({ title: 'lowdb' })
  .value()

// Manual writing
fs.writeFileSync('db.json', JSON.stringify(db.data()))
```

In this case, you may want to consider creating a custom storage instead.
