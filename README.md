# lowdb [![NPM version](https://badge.fury.io/js/lowdb.svg)](http://badge.fury.io/js/lowdb) [![Build Status](https://travis-ci.org/typicode/lowdb.svg?branch=master)](https://travis-ci.org/typicode/lowdb)

> Need a quick way to get a local database?

## Example

```javascript
var low = require('lowdb')
var db = low('db.json')

db('posts').push({ title: 'lowdb is awesome'})
```

Database is __automatically__ saved to `db.json`

```javascript
{
  "posts": [
    { "title": "lowdb is awesome" }
  ]
}
```

You can query and manipulate it using __any__ [lodash](https://lodash.com/docs) __method__

```javascript
db('posts').find({ title: 'lowdb is awesome' })
```

## Install

```bash
npm install lowdb --save
```

## Features

* Small
* Serverless
* lodash rich API
* In-memory or disk-based
* __Hackable__ (mixins, id, encryption, ...)

It's also __very easy to learn and use__ since it has __only 8 methods and properties__.

_lowdb powers [json-server](https://github.com/typicode/json-server) package, [jsonplaceholder](http://jsonplaceholder.typicode.com/) website and [other projects](https://www.npmjs.com/browse/depended/lowdb)._

## API

__low([filename, options])__

Creates a disk-based or in-memory database instance. If a filename is provided, it loads or creates it.

```javascript
var db = low()          // in-memory
var db = low('db.json') // disk-based
```

When a filename is provided you can set options.

```javascript
var db = low('db.json', {
  autosave: true, // automatically save database on change (default: true)
  async: true     // asynchronous write (default: true)
})
```

__low.stringify(obj)__ and __low.parse(str)__

Overwrite these methods to customize JSON stringifying and parsing.

__db.___

Database lodash instance. Use it for example to add your own utility functions or third-party libraries.

```javascript
db._.mixin({
  second: function(array) {
    return array[1]
  }
})

var song1 = db('songs').first()
var song2 = db('songs').second()
```

__db.object__

Use whenever you want to access or modify the underlying database object.

```javascript
if (db.object.songs) console.log('songs array exists')
```

__db.save([filename])__

Saves database to file.

```javascript
var db = low('db.json')
db.save() // saves to db.json
db.save('copy.json')
```

Note: In case you directly modify the content of the database object, you'll need to manually call `save`

```javascript
delete db.object.songs
db.save()
```

__db.saveSync([filename])__

Synchronous version of `db.save()`

## Guide

### Operations

With LowDB you get access to the entire [lodash API](http://lodash.com/), so there's many ways to query and manipulate data. Here are a few examples to get you started.

Please note that data is returned by reference, this means that modifications to returned objects may change the database. To avoid such behaviour, you need to use `.cloneDeep()`.

Also, the execution of chained methods is lazy, that is, execution is deferred until `.value()` is called.

Sort the top five songs.

```javascript
db('songs')
  .chain()
  .where({published: true})
  .sortBy('views')
  .take(5)
  .value()
```

Retrieve song titles.

```javascript
db('songs').pluck('titles')
```

Get the number of songs.

```javascript
db('songs').size()
```

Make a deep clone of songs.

```javascript
db('songs').cloneDeep()
```

Update a song.

```javascript
db('songs')
  .chain()
  .find({ title: 'low!' })
  .assign({ title: 'hi!'})
  .value()
```

Remove songs.

```javascript
db('songs').remove({ title: 'low!' })
```

### Id support

Being able to retrieve data using an id can be quite useful, particularly in servers. To add id-based resources support to lowdb, you have 2 options.

[underscore-db](https://github.com/typicode/underscore-db) provides a set of helpers for creating and manipulating id-based resources.

```javascript
var db = low('db.json')

db._.mixin(require('underscore-db'))

var songId = db('songs').insert({ title: 'low!' }).id
var song   = db('songs').getById(songId)
```

[uuid](https://github.com/broofa/node-uuid) returns a unique id.

```javascript
var uuid = require('uuid')

var songId = db('songs').push({ id: uuid(), title: 'low!' }).id
var song   = db('songs').find({ id: songId })
```

### Encryption support

In some cases, you may want to make it harder to read database content. By overwriting, `low.stringify` and `low.parse`, you can add custom encryption.

```javascript
var crypto = require('crypto')

var cipher = crypto.createCipher('aes256', secretKey)
var decipher = crypto.createDecipher('aes256', secretKey)

low.stringify = function(obj) {
  var str = JSON.stringify(obj)
  return cipher.update(str, 'utf8', 'hex') + cipher.final('hex')
}

low.parse = function(encrypted) {
  var str = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')
  return JSON.parse(str)
}
```

## Changelog

See details changes for each version in the [release notes](https://github.com/typicode/lowdb/releases).

## Limits

lowdb is a convenient method for storing data without setting up a database server. It's fast enough and safe to be used as an embedded database.

However, if you need high performance and scalability more than simplicity, you should stick to databases like MongoDB.

## License

MIT - [Typicode](https://github.com/typicode)
