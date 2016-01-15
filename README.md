# lowdb [![NPM version](https://badge.fury.io/js/lowdb.svg)](http://badge.fury.io/js/lowdb) [![Build Status](https://travis-ci.org/typicode/lowdb.svg?branch=master)](https://travis-ci.org/typicode/lowdb)

> Need a quick way to get a local database for a CLI, a small server or the browser?

## Example

```js
const low = require('lowdb')
const storage = require('lowdb/file-sync')
const db = low('db.json', { storage })

db('posts').push({ title: 'lowdb is awesome'})
```

Database is __automatically__ saved to `db.json`

```js
{
  "posts": [
    { "title": "lowdb is awesome" }
  ]
}
```

You can query and manipulate it using __any__ [lodash](https://lodash.com/docs) __method__.

```js
db('posts').find({ title: 'lowdb is awesome' })
```

_Examples use ES2015 syntax, it's supported by Node 5+. Node 0.12 is supported too but you need to use the older syntax._

```js
// For Node 0.12
var db = low('db.json', { storage: storage })
```

_Please note that lowdb can only be run in one instance of Node, it doesn't support Cluster._

## Install

```bash
npm install lowdb --save
```

## Features

* Very small (~100 lines for core)
* lodash API
* Extendable:
  * __Custom storage__ (file, browser, in-memory, ...)
  * __Custom format__ (JSON, BSON, YAML, ...)
  * __Mixins__ (id support, ...)
  * __Encryption__

Lowdb is also very easy to learn since it has __only a few methods and properties__.

_lowdb powers [json-server](https://github.com/typicode/json-server) package, [jsonplaceholder](http://jsonplaceholder.typicode.com/) website and [many other great projects](https://www.npmjs.com/browse/depended/lowdb)._

## Usage examples

Depending on the context, you can use different storages and formats.

Lowdb comes bundled with `file-sync`, `file-async` and `browser` storages, but you can also write your own if needed.

### CLI

For CLIs, it's easier to use `lowdb/file-sync` synchronous file storage .

```js
const low = require('lowdb')
const storage = require('lowdb/file-sync')

const db = low('db.json', { storage })

db('users').push({ name: 'typicode' })
const user = db('users').find({ name: 'typicode' })
```

### Server

For servers, it's better to avoid blocking requests. Use `lowdb/file-async` asynchronous file storage.

__Important__

* When you modify the database, a Promise is returned.
* When you read from the database, the result is immediately returned.

```js
const low = require('lowdb').
const storage = require('lowdb/file-async')

const db = low('db.json', { storage })

app.get('/posts/:id', (req, res) => {
  // Returns a post
  const post = db('posts').find({ id: req.params.id })
  res.send(post)
})

app.post('/posts', (req, res) => {
  // Returns a Promise that resolves to a post
  db('posts')
    .push(req.body)
    .then(post => res.send(post))
})
```

### Browser

In the browser, `lowdb/browser` will add `localStorage` support.

```js
const low = require('lowdb')
const storage = require('lowdb/browser')

const db = low('db', { storage })

db('users').push({ name: 'typicode' })
const user = db('users').find({ name: 'typicode' })
```

### In-memory

For the best performance, use lowdb in-memory storage.

```js
const low = require('lowdb')
const db = low()

db('users').push({ name: 'typicode' })
const user = db('users').find({ name: 'typicode' })
```

Please note that, as an alternative, you can also disable `writeOnChange` if you want to control when data is written.

## API

__low([filename, [storage, [writeOnChange = true]]])__

Creates a new database instance. Here are some examples:

```js
low()                                      // in-memory
low('db.json', { storage: /* */ })         // persisted
low('db.json', { storage: /* */ }, false)  // auto write disabled

// To create read-only or write-only database,
// set only storage.read or storage.write
const fileSync = require('lowdb/file-sync')

// write-only
low('db.json', {
  storage: { write: fileSync.write }
})

// read-only
low('db.json', {
  storage: { read: fileSync.read }
})
```

You can also define custom storages and formats:

```js
const myStorage = {
  read: (source, deserialize) => // obj or a Promise
  write: (dest, obj, serialize) => // undefined or a Promise
}

const myFormat = {
  format: {
    deserialize: (data) => // obj
    serialize: (obj) => // data
  }
}

low(source, { storage: myStorage, format: myFormat }, writeOnChange)
```

__db.___

Database lodash instance. Use it to add your own utility functions or third-party mixins like [underscore-contrib](https://github.com/documentcloud/underscore-contrib) or [underscore-db](https://github.com/typicode/underscore-db).

```js
db._.mixin({
  second: function(array) {
    return array[1]
  }
})

const post1 = db('posts').first()
const post2 = db('posts').second()
```

__db.object__

Use whenever you want to access or modify the underlying database object.

```js
db.object // { posts: [ ... ] }
```

If you directly modify the content of the database object, you will need to manually call `write` to persist changes.

```js
// Delete an array
delete db.object.posts
db.write()

// Drop database
db.object = {}
db.write()
```

__db.write([source])__

Persists database using `storage.write` method. Depending on the storage, it may return a promise.

Note: by default, lowdb automatically calls it when database changes.

```js
const db = low('db.json', { storage })
db.write()            // writes to db.json
db.write('copy.json') // writes to copy.json
```

__db.read([source])__

Reads source using `storage.read` method. Depending on the storage, it may return a promise.

```js
const db = low('db.json', { storage })
db.read()            // re-reads db.json
db.read('copy.json') // reads copy.json
```

## Guide

### How to query

With lowdb, you get access to the entire [lodash API](http://lodash.com/), so there is many ways to query and manipulate data. Here are a few examples to get you started.

Please note that data is returned by reference, this means that modifications to returned objects may change the database. To avoid such behaviour, you need to use `.cloneDeep()`.

Also, the execution of chained methods is lazy, that is, execution is deferred until `.value()` is called.

#### Examples

Sort the top five posts.

```js
db('posts')
  .chain()
  .filter({published: true})
  .sortBy('views')
  .take(5)
  .value()
```

Retrieve post titles.

```js
db('posts').map('title')
```

Get the number of posts.

```js
db('posts').size()
```

Make a deep clone of posts.

```js
db('posts').cloneDeep()
```

Update a post.

```js
db('posts')
  .chain()
  .find({ title: 'low!' })
  .assign({ title: 'hi!'})
  .value()
```

Remove posts.

```js
db('posts').remove({ title: 'low!' })
```

### How to use id based resources

Being able to retrieve data using an id can be quite useful, particularly in servers. To add id-based resources support to lowdb, you have 2 options.

[underscore-db](https://github.com/typicode/underscore-db) provides a set of helpers for creating and manipulating id-based resources.

```js
const db = low('db.json')

db._.mixin(require('underscore-db'))

const postId = db('posts').insert({ title: 'low!' }).id
const post = db('posts').getById(postId)
```

[uuid](https://github.com/broofa/node-uuid) is more minimalist and returns a unique id that you can use when creating resources.

```js
const uuid = require('uuid')

const postId = db('posts').push({ id: uuid(), title: 'low!' }).id
const post = db('posts').find({ id: postId })
```

### How to use custom format

By default, lowdb storages will use `JSON` to `parse` and `stringify` database object.

But it's also possible to specify custom `format.serializer` and `format.deserializer` methods that will be passed by lowdb to `storage.read` and `storage.write` methods.

For example, if you want to store database in `.bson` files ([MongoDB file format](https://github.com/mongodb/js-bson)):

```js
const low = require('lowdb')
const storage = require('lowdb/file-sync')
const bson = require('bson')
const BSON = new bson.BSONPure.BSON()

low('db.bson', { storage, format: {
  serialize: BSON.serialize,
  deserialize: BSON.deserialize
}})

// Alternative ES2015 short syntax
const bson = require('bson')
const format = new bson.BSONPure.BSON()
low('db.bson', { storage, format })
```

### How to encrypt data

Simply `encrypt` and `decrypt` data in `format.serialize` and `format.deserialize` methods.

For example, using [cryptr](https://github.com/MauriceButler/cryptr):

```js
const Cryptr = require("./cryptr"),
const cryptr = new Cryptr('my secret key')

const db = low('db.json', {
  format: {
    deserialize: (str) => {
      const decrypted = cryptr.decrypt(str)
      const obj = JSON.parse(decrypted)
      return obj
    },
    serialize: (obj) => {
      const str = JSON.stringify(obj)
      const encrypted = cryptr.encrypt(str)
      return encrypted
    }
  }
})
```

## Changelog

See changes for each version in the [release notes](https://github.com/typicode/lowdb/releases).

## Limits

lowdb is a convenient method for storing data without setting up a database server. It is fast enough and safe to be used as an embedded database.

However, if you seek high performance and scalability more than simplicity, you should probably stick to traditional databases like MongoDB.

## License

MIT - [Typicode](https://github.com/typicode)
