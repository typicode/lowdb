# Lowdb [![NPM version](https://badge.fury.io/js/lowdb.svg)](http://badge.fury.io/js/lowdb) [![Build Status](https://travis-ci.org/typicode/lowdb.svg?branch=master)](https://travis-ci.org/typicode/lowdb) [![Support on Patreon](https://img.shields.io/badge/donate-%E2%99%A5-ff69b4.svg)](https://www.patreon.com/typicode)

> A small local database powered by lodash API

```js
// Pick an adapter: file sync/async, localStorage or create your own
const file = new low.FileSync('db.json')

// Create your instance
const db = low(file)

// Set some defaults if your JSON file is empty
db.defaults({ posts: [], user: {} })
  .write()

// Add a post and write to file
db.get('posts')
  .push({ id: 1, title: 'lowdb is awesome'})
  .write()

// Set a user using Lodash shortcuts
db.set('user.name', 'typicode')
  .write()
```

Data is saved to `db.json`

```json
{
  "posts": [
    { "id": 1, "title": "lowdb is awesome"}
  ],
  "user": {
    "name": "typicode"
  }
}
```

You can use any [lodash](https://lodash.com/docs) function like [`_.get`](https://lodash.com/docs#get) and [`_.find`](https://lodash.com/docs#find) with shorthand syntax.

```js
// Use .value() instead of .write() if you're only reading from db
db.get('posts')
  .find({ id: 1 })
  .value()
```

Lowdb is perfect for CLIs, small servers, Electron apps and npm packages in general.

It supports __Node__, the __browser__ and uses __lodash API__, so it's very simple to learn. Actually, if you know Lodash you already know how to use lowdb :wink:

* [Usage examples](https://github.com/typicode/lowdb/tree/master/examples)
  * [CLI](https://github.com/typicode/lowdb/tree/master/examples#cli)
  * [Browser](https://github.com/typicode/lowdb/tree/master/examples#browser)
  * [Server](https://github.com/typicode/lowdb/tree/master/examples#server)
  * [In-memory](https://github.com/typicode/lowdb/tree/master/examples#in-memory)
* [lowdb/lib/fp](https://github.com/typicode/lowdb/tree/master/examples/fp.md)
* [JSFiddle live example](https://jsfiddle.net/typicode/4kd7xxbu/)
* [__Migrating from 0.14 to 0.15? See this guide.__](https://github.com/typicode/lowdb/releases/tag/v0.15.0)

## Why lowdb?

* Lodash API
* Minimal and simple to use
* Highly flexible
  * __Custom storage__ (file, browser, in-memory, ...)
  * __Custom format__ (JSON, BSON, YAML, XML, ...)
  * Mixins (id support, ...)
  * Read-only or write-only modes
  * Encryption

__Important__ lowdb doesn't support Cluster.

## Used by

* [typicode/json-server](https://github.com/typicode/json-server) - REST API with zero coding
* [henryboldi/felony](https://github.com/henryboldi/felony) - Next Level PGP
* [googlesamples/md2googleslides](https://github.com/googlesamples/md2googleslides) - Generate Google Slides from markdown
* [sqren/fb-sleep-stats](https://github.com/sqren/fb-sleep-stats) - Sleeping habits tracker
* [panzhangwang/getAwesomeness](https://github.com/panzhangwang/getAwesomeness) - All amazing awesomeness from Github
* [redux-promise-middleware](https://github.com/pburtchaell/redux-promise-middleware) - Redux middleware
* [sasha-alias/sqltabs](https://github.com/sasha-alias/sqltabs) - Rich SQL client
* ... and [__900+ repositories__](https://libraries.io/npm/lowdb/dependent-repositories)

## Install

```sh
npm install lowdb
```

Alternatively, if you're using [yarn](https://yarnpkg.com/)

```sh
yarn add lowdb
```

A UMD build is also available on [unpkg](https://unpkg.com/) for testing and quick prototyping:

```html
<script src="https://unpkg.com/lodash@4/lodash.min.js"></script>
<script src="https://unpkg.com/lowdb/dist/lowdb.min.js"></script>
<script>
  var adapter = new low.LocalStorage('db')
  var db = low(adapter)
</script>
```

## API

__low([adapter = low.Memory()])__

Creates a __lodash chain__, you can use __any__ lodash method on it. When `.value()` is called data is saved using `storage`. By default, will use [Memory](src/adapters/Memory) adapter which is a noop adapter.

__db.___

Database lodash instance. Use it to add your own utility functions or third-party mixins like [underscore-contrib](https://github.com/documentcloud/underscore-contrib) or [lodash-id](https://github.com/typicode/lodash-id).

```js
db._.mixin({
  second: function(array) {
    return array[1]
  }
})

const post1 = db.get('posts').first().value()
const post2 = db.get('posts').second().value()
```

__db.getState()__

Use whenever you want to access the database state.

```js
db.getState() // { posts: [ ... ] }
```

__db.setState(newState)__

Use it to drop database or set a new state.

```js
const newState = {}
db.setState(newState)
```

__db.write()__

Persists database using `adapter.write`. Depending on the adapter, it may return a promise (for example, with `file-async`).

By default, lowdb automatically calls it when database changes.

```js
const db = low(new low.FileSync('db.json'))
db.write()
console.log('Data has been saved')

const db = low(new low.FileAsync('db.json'))
db.write()
  .then(() => console.log('Data has been saved'))
```

__db.read()__

Reads source using `storage.read` option. Depending on the adapter, it may return a promise.

## Guide

### How to query

With lowdb, you get access to the entire [lodash API](http://lodash.com/), so there are many ways to query and manipulate data. Here are a few examples to get you started.

Please note that data is returned by reference, this means that modifications to returned objects may change the database. To avoid such behaviour, you need to use `.cloneDeep()`.

Also, the execution of methods is lazy, that is, execution is deferred until `.value()` is called.

#### Examples

Check if posts exists.

```js
db.has('posts')
  .value()
```

Set posts.

```js
db.set('posts', [])
  .write()
```


Sort the top five posts.

```js
db.get('posts')
  .filter({published: true})
  .sortBy('views')
  .take(5)
  .value()
```

Get post titles.

```js
db.get('posts')
  .map('title')
  .value()
```

Get the number of posts.

```js
db.get('posts')
  .size()
  .value()
```

Get the title of first post using a path.

```js
db.get('posts[0].title')
  .value()
```

Update a post.

```js
db.get('posts')
  .find({ title: 'low!' })
  .assign({ title: 'hi!'})
  .write()
```

Remove posts.

```js
db.get('posts')
  .remove({ title: 'low!' })
  .write()
```

Remove a property.

```js
db.unset('user.name')
  .write()
```

Make a deep clone of posts.

```js
db.get('posts')
  .cloneDeep()
  .value()
```


### How to use id based resources

Being able to get data using an id can be quite useful, particularly in servers. To add id-based resources support to lowdb, you have 2 options.

[lodash-id](https://github.com/typicode/lodash-id) provides a set of helpers for creating and manipulating id-based resources.

```js
const db = low('db.json')

db._.mixin(require('lodash-id'))

const postId = db.get('posts').insert({ title: 'low!' }).write().id
const post = db.get('posts').getById(postId).value()
```

[uuid](https://github.com/broofa/node-uuid) is more minimalist and returns a unique id that you can use when creating resources.

```js
const uuid = require('uuid')

const postId = db.get('posts').push({ id: uuid(), title: 'low!' }).write().id
const post = db.get('posts').find({ id: postId }).value()
```

### How to use a custom storage or format

`low()` accepts custom storage or format. Simply create objects with `read/write` or `serialize/deserialize` methods. See `src/browser.js` code source for a full example.

```js
const myStorage = {
  read: (source, deserialize) => // must return an object or a Promise
  write: (source, obj, serialize) => // must return undefined or a Promise
}

const myFormat = {
  serialize: (obj) => // must return data (usually string)
  deserialize: (data) => // must return an object
}

low(source, {
  storage: myStorage,
  format: myFormat
})
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
