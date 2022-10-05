# lowdb [![](http://img.shields.io/npm/dm/lowdb.svg?style=flat)](https://www.npmjs.org/package/lowdb) [![Node.js CI](https://github.com/typicode/lowdb/actions/workflows/node.js.yml/badge.svg)](https://github.com/typicode/lowdb/actions/workflows/node.js.yml)

> Simple to use local JSON database. Powered by plain JavaScript 🦉

```js
// Edit db.json content using plain JS
db.data
  .posts
  .push({ id: 1, title: 'lowdb is awesome' })

// Save to file
db.write()
```

```js
// db.json
{
  "posts": [
    { "id": 1, "title": "lowdb is awesome" }
  ]
}
```

If you like lowdb, see also [xv](https://github.com/typicode/xv) (test runner) and [steno](https://github.com/typicode/steno) (fast file writer).

## Sponsors

<br>
<br>

<p align="center">
  <a href="https://mockend.com/" target="_blank">
    <img src="https://jsonplaceholder.typicode.com/mockend.svg" height="70px">
  </a>
</p>

<br>
<br>

[Become a sponsor and have your company logo here](https://github.com/sponsors/typicode).

Please help me build OSS 👉 [GitHub Sponsors](https://github.com/sponsors/typicode)

## Features

- __Lightweight__
- __Minimalist__
- __TypeScript__
- __plain JS__
- Atomic write
- Hackable:
  - Change storage, file format (JSON, YAML, ...) or add encryption via [adapters](#adapters)
  - Add lodash, ramda, ... for super powers!

## Install

```sh
npm install lowdb
```

## Usage

_Lowdb 3 is a pure ESM package. If you're having trouble importing it in your project, please [read this](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)._

```js
import { join, dirname } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use JSON file for storage
const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

// Read data from JSON file, this will set db.data content
await db.read()

// If db.json doesn't exist, db.data will be null
// Set default data
// db.data = db.data || { posts: [] } // Node < v15.x
db.data ||= { posts: [] }             // Node >= 15.x

// Create and query items using plain JS
db.data.posts.push('hello world')
const firstPost = db.data.posts[0]

// Alternatively, you can also use this syntax if you prefer
const { posts } = db.data
posts.push('hello world')

// Finally write db.data content to file
await db.write()
```

```js
// db.json
{
  "posts": [ "hello world" ]
}
```

### TypeScript

You can use TypeScript to type check your data.

```ts
type Data = {
  words: string[]
}

const adapter = new JSONFile<Data>('db.json')
const db = new Low(adapter)

db.data
  .words
  .push('foo') // ✅

db.data
  .words
  .push(1) // ❌
```

### Lodash

You can also add lodash or other utility libraries to improve lowdb.

```ts
import lodash from 'lodash'

type Post = {
  id: number;
  title: string;
}

type Data = {
  posts: Post[]
}

// Extend Low class with a new `chain` field
class LowWithLodash<T> extends Low<T> {
  chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data')
}

const adapter = new JSONFile<Data>('db.json')
const db = new LowWithLodash(adapter)
await db.read()

// Instead of db.data use db.chain to access lodash API
const post = db.chain
  .get('posts')
  .find({ id: 1 })
  .value() // Important: value() must be called to execute chain
```

### More examples

For CLI, server and browser usage, see [`examples/`](/examples) directory.

## API

### Classes

Lowdb has two classes (for asynchronous and synchronous adapters).

#### `new Low(adapter)`

```js
import { Low, JSONFile } from 'lowdb'

const db = new Low(new JSONFile('file.json'))
await db.read()
await db.write()
```

#### `new LowSync(adapterSync)`

```js
import { LowSync, JSONFileSync } from 'lowdb'

const db = new LowSync(new JSONFileSync('file.json'))
db.read()
db.write()
```

### Methods

#### `db.read()`

Calls `adapter.read()` and sets `db.data`.

**Note:** `JSONFile` and `JSONFileSync` adapters will set `db.data` to `null` if file doesn't exist.

```js
db.data // === null
db.read()
db.data // !== null
```

#### `db.write()`

Calls `adapter.write(db.data)`.

```js
db.data = { posts: [] }
db.write() // file.json will be { posts: [] }
db.data = {}
db.write() // file.json will be {}
```

### Properties

#### `db.data`

Holds your db content. If you're using the adapters coming with lowdb, it can be any type supported by [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).

For example:

```js
db.data = 'string'
db.data = [1, 2, 3]
db.data = { key: 'value' }
```

## Adapters

### Lowdb adapters

#### `JSONFile` `JSONFileSync`

Adapters for reading and writing JSON files.

```js
new Low(new JSONFile(filename))
new LowSync(new JSONFileSync(filename))
```

#### `Memory` `MemorySync`

In-memory adapters. Useful for speeding up unit tests.

```js
new Low(new Memory())
new LowSync(new MemorySync())
```

#### `LocalStorage`

Synchronous adapter for `window.localStorage`.

```js
new LowSync(new LocalStorage(name))
```

#### `TextFile` `TextFileSync`

Adapters for reading and writing text. Useful for creating custom adapters.

### Third-party adapters

If you've published an adapter for lowdb, feel free to create a PR to add it here.

### Writing your own adapter

You may want to create an adapter to write `db.data` to YAML, XML, encrypt data, a remote storage, ...

An adapter is a simple class that just needs to expose two methods:

```js
class AsyncAdapter {
  read() { /* ... */ } // should return Promise<data>
  write(data) { /* ... */ } // should return Promise<void>
}

class SyncAdapter {
  read() { /* ... */ } // should return data
  write(data) { /* ... */ } // should return nothing
}
```

For example, let's say you have some async storage and want to create an adapter for it:

```js
import { api } from './AsyncStorage'

class CustomAsyncAdapter {
  // Optional: your adapter can take arguments
  constructor(args) {
    // ...
  }

  async read() {
    const data = await api.read()
    return data
  }

  async write(data) {
    await api.write(data)
  }
}

const adapter = new CustomAsyncAdapter()
const db = new Low(adapter)
```

See [`src/adapters/`](src/adapters) for more examples.

#### Custom serialization

To create an adapter for another format than JSON, you can use `TextFile` or `TextFileSync`. 

For example:

```js
import { Adapter, Low, TextFile } from 'lowdb'
import YAML from 'yaml'

class YAMLFile {
  constructor(filename) {
    this.adapter = new TextFile(filename)
  }

  async read() {
    const data = await this.adapter.read()
    if (data === null) {
      return null
    } else {
      return YAML.parse(data)
    }
  }

  write(obj) {
    return this.adapter.write(YAML.stringify(obj))
  }
}

const adapter = new YAMLFile('file.yaml')
const db = new Low(adapter)
```

## Limits

Lowdb doesn't support Node's cluster module.

If you have large JavaScript objects (`~10-100MB`) you may hit some performance issues. This is because whenever you call `db.write`, the whole `db.data` is serialized using `JSON.stringify` and written to storage.

Depending on your use case, this can be fine or not. It can be mitigated by doing batch operations and calling `db.write` only when you need it. 

If you plan to scale, it's highly recommended to use databases like PostgreSQL or MongoDB instead.
