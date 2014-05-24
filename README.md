# LowDB [![NPM version](https://badge.fury.io/js/lowdb.svg)](http://badge.fury.io/js/lowdb) [![Build Status](https://travis-ci.org/typicode/lowdb.svg)](https://travis-ci.org/typicode/lowdb)

```javascript
var low = require('lowdb');
low('songs').insert({title: 'low!'});
```

Database is saved to `db.json`:

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

## API

__low(collection)__

Returns or create a [Lo-Dash](http://lodash.com/docs) wrapped array with [Underscore.db](https://github.com/typicode/underscore.db) methods.

Therefore you can use Lo-Dash collections methods and Underscore.DB methods. Don't forget to add `.value()` to get the returned value.

Examples:

```javascript
// get
var song  = low('songs').get(newSong.id).value();

// where
var songs = low('songs').where({title: 'low!'}).value();

// insert
var song  = low('songs').insert({title: 'low!'}).value();

// update
var song  = low('songs').update(id, {title: 'new title'}).value()

// updateWhere
var songs = low('songs').updateWhere({published: false}, {published: true}).value()

// remove
var song  = low('songs').remove(id).value()

// removeWhere
var songs = low('songs').removeWhere({title: 'low!'}).value();
```

__low.save([path])__

Saves database to `path` or `low.path` which is `db.json` by default.

__low.load([path])__

Loads database from `path` or `low.path` which is `db.json` by default.

__low.path__

Use this property to change where the database is saved. Default to `db.json`

```javascript
low.path = '/some/path/file.json'
```

__low.autoSave__

Use this property to save to file when database is changed. Default to `true`

```javascript
low.autoSave = true
```

## Short syntax

LowDB has also a short syntax for the most common operations if you're kind of minimalist

```javascript
// get
var song  = low('songs', id);

// where
var songs = low('songs', {title: 'low!'});

// insert
var song  = low('songs', {title: 'low!'}, 1);

// update
var song  = low('songs', id, {title: 'new title'});

// updateWhere
var songs = low('songs', {published: false}, {published: true});

// remove
var song  = low('songs', id, -1);

// removeWhere
var songs = low('songs', {title: 'low!'}, -1);
```
