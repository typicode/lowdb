# LowDB [![NPM version](https://badge.fury.io/js/lowdb.svg)](http://badge.fury.io/js/lowdb) [![Build Status](https://travis-ci.org/typicode/lowdb.svg)](https://travis-ci.org/typicode/lowdb)

> Flat JSON file database. Used in JSON-Server.

## Serverless

Instantly ready to go.

```javascript
var low = require('lowdb')
low('songs').insert({title: 'low!'})
```

## Transparent

Database is automatically created and saved to `db.json` in a readable format.

```javascript
{
  "songs": [
    {
      "title": "low!",
      "id": "e31aa48c-a9d8-4f79-9fce-ded4c16c3c4c"
    }
  ]
}
```

## Speedy

Benchmarked on a 2013 PC.

```
get    x 1000    0.837708 ms
update x 1000    4.433322 ms
insert x 1000    11.78481 ms
remove x 1000    24.60179 ms
```

Try it yourself:

```bash
$ git clone https://github.com/typicode/lowdb.git && cd lowdb
$ npm install
$ npm run benchmark
```


## Elegant

To make requests, you can chain methods or you can use LowDB  __unique short syntax__. 

The short syntax covers only the most common operations and lets you write really concise code.

```javascript
// -------------------------------------------------
// Chaining syntax (explicit and similar to Lo-Dash)
// -------------------------------------------------

// get
var song  = low('songs').get(id).value()

// where
var songs = low('songs').where({title: 'low!'}).value()

// insert
var song  = low('songs').insert({title: 'low!'}).value()

// update
var song  = low('songs').update(id, {title: 'new title'}).value()

// updateWhere
var songs = low('songs').updateWhere({published: false}, {published: true}).value()

// remove
var song  = low('songs').remove(id).value()

// removeWhere
var songs = low('songs').removeWhere({title: 'low!'}).value()


// --------------------------------
// Short syntax (really minimalist)
// --------------------------------

// get
var song  = low('songs', id)

// where
var songs = low('songs', {title: 'low!'})

// insert
var song  = low('songs', {title: 'low!'}, 1)

// update
var song  = low('songs', id, {title: 'new title'})

// updateWhere
var songs = low('songs', {published: false}, {published: true})

// remove
var song  = low('songs', id, -1)

// removeWhere
var songs = low('songs', {title: 'low!'}, -1)
```

## API

### Methods

__Collections methods__

LowDB is built on [Lo-Dash](http://lodash.com/docs) and [Underscore.db](https://github.com/typicode/underscore.db). Therefore you can use any of the __50+ collections methods__ of both libraries: where, find, filter, sortBy, groupBy, ...

__low(collection)__

Returns or create a Lo-Dash wrapped array with Underscore.db methods.

If the returned value is an object or array and you want to get its value, add `.value()`. It can be omitted though if you just want to modify the database.

```javascript
var topFiveSongs = low('posts')
  .where({published: true})
  .sortBy('views')
  .first(5)
  .value();
  
var songTitles = low('songs')
  .pluck('titles')
  .value()
  
var total = low('songs').size()
```

__low.save([path])__

Saves database to `path` or `low.path`. By default `db.json`.

__low.load([path])__

Loads database from `path` or `low.path`. By default `db.json`.

### Events

- add (collectionName, insertedDoc)
- update (collectionName, updatedDoc, previousDoc)
- remove (collectionName, removedDoc)
- change ()

```javascript
low.on('add', function(name, doc) {
  console.log('new doc: ' + doc.title + ' added to ' + name)
})
```

### Options

__low.path__

Use this property to change where the database is saved. By default `db.json`.

```javascript
low.path = '/some/path/file.json'
```

__low.autoSave__

Set to `false` to disable save on change. Great to turn LowDB into a read-only or in-memory database. By default `true`.

```javascript
low.autoSave = true
```