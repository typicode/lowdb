# LowDB [![NPM version](https://badge.fury.io/js/lowdb.svg)](http://badge.fury.io/js/lowdb) [![Build Status](https://travis-ci.org/typicode/lowdb.svg?branch=master)](https://travis-ci.org/typicode/lowdb)

> Flat JSON file database for Node

* Serverless
* Multiple databases
* In-memory or disk-based
* 80+ methods from Lo-Dash API
* Asynchronous and fault-tolerant writing
* Extendable

LowDB uses Lo-Dash functional programming API instead of a MongoDB-like API. This makes it quite unique and different.

_LowDB powers [JSON Server](https://github.com/typicode/json-server) and [JSONPlaceholder](http://jsonplaceholder.typicode.com/). If you need something similar for the browser, check [Underscore-db](https://github.com/typicode/underscore-db)._

## Usage

```javascript
var low = require('lowdb')
var db = low('db.json')

db('songs').push({ title: 'low!'})
```

Database is automatically created and saved to `db.json` in a readable format.

```javascript
{
  "songs": [
    {
      "title": "low!"
    }
  ]
}
```

Data can be queried and manipulated using any Lo-Dash method.

```javascript
var song = db('songs').find({ title: 'low!' }).value()
db('songs').remove({ title: 'low!' })
```

You can also use id-based methods by extending LowDB with [Underscore-db](https://github.com/typicode/underscore-db).

## API

__low([filename])__

Creates a disk-based or in-memory database instance. If a filename is provided, it loads or creates it.

```javascript
var db = low()          // in-memory
var db = low('db.json') // disk-based
```

__low.mixin(source)__

Use it to extend Lo-Dash globally with your own utility functions or third-party libraries.

```javascript
// Must be called before calling db('songs') for functions to be available.
low.mixin({
  second: function(array) {
    if (array.length >= 2) return array[1]
  }
})

var song = db('songs').second().value()
```

__low.stringify(obj)__ and __low.parse(str)__

Overwrite these methods to customize JSON stringifying and parsing.

__db.object__

Database object. Useful if you want to access the content of your JSON file and don't want to go through Lo-Dash methods.

```javascript
console.log(db.object) // { songs: [ { title: 'low!' } ] }
db('songs').value() === db.object.songs
```

__db.save()__

LowDB automatically saves to disk. However, in case you directly modify the content of the database object, you'll need to manually call `save`.

```javascript
delete db.object.songs
db.save()
```

## Documentation

### Operations

With LowDB you get access to the entire [Lo-Dash API](http://lodash.com/), so there's many, many ways to query and manipulate data. Here are a few examples to get you started.

Sort the top five songs.

```javascript
db('songs')
  .where({published: true})
  .sortBy('views')
  .first(5)
  .value()
```

Retrieve song titles.

```javascript
db('songs')
  .pluck('titles')
  .value()
```

Get the number of songs.

```javascript
db('songs').size()
```

Make a deep clone of songs.

```javascript
db('songs').cloneDeep().value
```

Update a song.

```javascript
db('songs').find({ title: 'low!' }).assign({ title: 'hi!'})
```

Remove songs.

```javascript
db('songs').remove({ title: 'low!' })
```

### Id-based resources support

Being able to retrieve data using an id can be quite useful, particularly in servers. To add id-based resources support to LowDB, you have 2 options.

[Underscore-db](https://github.com/typicode/underscore-db) provides a set of helpers for creating and manipulating id-based resources.

```javascript
low.mixin(require('underscore-db'))

var db = low('db.json')

var songId = db('songs').insert({ title: 'low!' }).value().id
var song   = db('songs').get(songId).value()
```

Or simply use [uuid](https://github.com/broofa/node-uuid).

```javascript
var uuid = require('uuid')

var songId = db('songs').push({ id: uuid(), title: 'low!' }).value().id
var song   = db('songs').find({ id: songId }).value()
```

In both cases, your `db.json` will then look like this.

```javascript
{
  "songs": [
    {
      "id": "e31aa48c-a9d8-4f79-9fce-ded4c16c3c4c",
      "title": "low!"
    }
  ]
}
```

## Changelog

See details changes for each version in the [release notes](https://github.com/typicode/lowdb/releases).

## Limits

LowDB is a convenient method for storing data without setting up a database server. It's fast enough and safe to be used as an embedded database.

However, if you need high performance and scalability more than simplicity, you should stick to databases like MongoDB.

## License

LowDB is released under the MIT License.
