# LowDB [![NPM version](https://badge.fury.io/js/lowdb.svg)](http://badge.fury.io/js/lowdb) [![Build Status](https://travis-ci.org/typicode/lowdb.svg)](https://travis-ci.org/typicode/lowdb)

> Flat JSON file database for Node

* Serverless
* Speedy
* Evented
* 50+ methods coming from Lo-Dash

LowDB is built on Lo-Dash, this makes it quite different and unique compared to other serverless databases often based on MongoDB API.

_LowDB powers [JSON Server](https://github.com/typicode/json-server) and [JSONPlaceholder](http://jsonplaceholder.typicode.com/)._

_If you need something similar for the browser, check [Underscore.db](https://github.com/typicode/underscore.db)._

## Usage

```javascript
var low = require('lowdb')
low('songs').insert({title: 'low!'})
```

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

To query data, you can use Lo-Dash methods.

```javascript
var songs = low('songs').where({ title: 'low!' }).value()
```

Or LowDB equivalent short syntax.

```javascript
var songs = low('songs', { title: 'low!' })
```

Changes can also be monitored.

```javascript
low.on('add', function(name, object) {
  console.log(object + 'added to' + name)
})
```

## Benchmark

```
get    x 1000    0.837708 ms
update x 1000    4.433322 ms
insert x 1000    11.78481 ms
remove x 1000    24.60179 ms
```

_To run the benchmark on your machine, clone the project and run `npm install && npm run benchmark`._

## API

__low(collection)__

Returns or create a [Lo-Dash](http://lodash.com/docs) wrapped array.

You can then use methods like: `where`, `find`, `filter`, `sortBy`, `groupBy`, ... and also methods from [Underscore.db](https://github.com/typicode/underscore.db).

```javascript
var topFiveSongs = low('songs')
  .where({published: true})
  .sortBy('views')
  .first(5)
  .value();
  
var songTitles = low('songs')
  .pluck('titles')
  .value()
  
var total = low('songs').size()
```

_If you just want to modify the database, without getting the returned array or object, you can omit `.value()`_

__low.save([path])__

Saves database to `path` or `low.path`. By default `db.json`.

__low.load([path])__

Loads database from `path` or `low.path`. By default `db.json`.

__low.path__

Database location. By default `db.json`.

```javascript
low.path = '/some/path/file.json'
```

__autoSave__

Set to `false` to disable save on change, this turns LowDB into a read-only in-memory database. By default `true`.

```javascript
low.autoSave = true
```

## Events

* add(collectionName, insertedDoc)
* update(collectionName, updatedDoc, previousDoc)
* remove(collectionName, removedDoc)
* change()

## Short syntax

LowDB short syntax covers only the most common operations but lets you write really concise code.

```javascript
low('songs', id)
// == low('songs').get(id).value()
```

```javascript
low('songs', {title: 'low!'})
// == low('songs').where({title: 'low!'}).value()
```

```javascript
low('songs', {title: 'low!'}, +1)
// == low('songs').insert({title: 'low!'}).value()
```

```javascript
low('songs', {title: 'low!'}, -1)
// == low('songs').removeWhere({title: 'low!'}).value()
```

```javascript
low('songs', id, -1)
// == low('songs').remove(id).value()
```

```javascript
low('songs', id, {title: 'new title'})
// == low('songs').update(id, {title: 'new title'}).value()
```

```javascript
low('songs', {published: false}, {published: true})
// == low('songs').updateWhere({published: false}, {published: true}).value()
```

## FAQ

__How is database saved?__

Database is only saved to disk when you call `insert`, `update`, `updateWhere`, `remove`, `removeWhere`.
Also writing is synchronous but throttled to keep things fast. 

Here's an example to illustrate:

```javascript
low('posts').insert({ title: 'foo' }) // database is persisted synchronously
low('posts').insert({ title: 'foo' }) // database is not persisted
low('posts').insert({ title: 'foo' }) // database is not persisted
// 100 ms later database will be persisted synchronously
```

So in 1 second, LowDB will make, at most, 10 synchronous writes.

_Future versions of LowDB may be fully asynchronous._

__Does it support concurrency?__

Yes. Node being single threaded and changes to database being synchronously written, there's no risk of having concurrency problems.

## License

LowDB is released under the MIT License.
