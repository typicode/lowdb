# low

[![NPM version](https://badge.fury.io/js/lowdb.png)](http://badge.fury.io/js/lowdb)
[![Build Status](https://travis-ci.org/typicode/lowdb.png)](https://travis-ci.org/typicode/lowdb)

## Example

```bash
$ npm i lowdb --save
```

```javascript
var low = require('lowdb');

// insert a song
low('songs').insert({title: 'low!'});

// find all songs named 'low!'
var songs = low('songs').where({title: 'low!'}).value();
```

Database is saved to `db.json`.

## API

See [Underscore.db](https://github.com/typicode/underscore.db) and [Lo-Dash](http://lodash.com/docs).
