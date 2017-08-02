# Lowdb

[![](http://img.shields.io/npm/dm/lowdb.svg?style=flat)](https://www.npmjs.org/package/lowdb) [![NPM version](https://badge.fury.io/js/lowdb.svg)](http://badge.fury.io/js/lowdb) [![Build Status](https://travis-ci.org/typicode/lowdb.svg?branch=master)](https://travis-ci.org/typicode/lowdb) [![Support on Patreon](https://img.shields.io/badge/Patreon-%E2%99%A5-ff69b4.svg)](https://www.patreon.com/typicode)

> Lodash powered mini database

```js
db.get('posts')
  .push({ id: 1, title: 'lowdb is awesome'})
  .write()
```

## Usage

```sh
npm install lowdb
```

```js
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

// Lowdb comes with adapters for JSON files and localStorage
// but you can create adapters for other storages or DB
const adapter = new FileSync('db.json')

// Create an instance
const db = low(adapter)

// Set some defaults if your JSON file is empty
db.defaults({ posts: [], user: {} })
  .write()

// Add a post
db.get('posts')
  .push({ id: 1, title: 'lowdb is awesome'})
  .write()

// Set a user using Lodash powerful shorthand syntax
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

__low(adapter)__

Creates a __lodash chain__, you can use __any__ lodash method on it. When `.write()` is called data is saved using `adapter`.

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

Returns database state.

```js
db.getState() // { posts: [ ... ] }
```

__db.setState(newState)__

Set a new state.

```js
const newState = {}
db.setState(newState)
```

__db.write()__

Persists database using `adapter.write`. Depending on the adapter, it may return a promise (for example, with `file-async`).

```js
// With FileSync
db.write()
console.log('State has been saved')

// With FileAsync
db.write()
  .then(() => console.log('State has been saved'))
```

__db.read()__

Reads source using `storage.read` option. Depending on the adapter, it may return a promise.

```js
// With FileSync
db.read()
console.log('State has been updated')

// With FileAsync
db.write()
  .then(() => console.log('State has been updated'))
```

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

const postId = db
  .get('posts')
  .insert({ title: 'low!' })
  .write()
  .id
  
const post = db
  .get('posts')
  .getById(postId)
  .value()
```

[shortid](https://github.com/dylang/shortid) is more minimalist and returns a unique id that you can use when creating resources.

```js
const shortid = require('shortid')

const postId = db
  .get('posts')
  .push({ id: shortid.generate(), title: 'low!' })
  .write()
  .id
  
const post = db
  .get('posts')
  .find({ id: postId })
  .value()
```

### How to create a custom Adapter

`low()` accepts custom Adapter, so you can virtually save your data to any storage. 

```js
class MyStorage {
  constructor() {
    // ...
  }
  
  read() {
    // Return data or a Promise
  }
  
  write(data) {
    // return nothing or a Promise
  }
}
```

### How to encrypt data

```js
class EncryptedFile extends lowdb.FileSync {
  read() {
    const encryptedData = super.read()
    return decrypt(encryptedData)
  }

  write(data) {
    const encryptedData = encrypt(data)
    super.write(encryptedData)
  }
}

const db = low(new EncryptedFile('db.json'))
```

## Changelog

See changes for each version in the [release notes](https://github.com/typicode/lowdb/releases).

## Limits

lowdb is a convenient method for storing data without setting up a database server. It is fast enough and safe to be used as an embedded database.

However, if you seek high performance and scalability more than simplicity, you should probably stick to traditional databases like MongoDB.

## License

MIT - [Typicode](https://github.com/typicode)
