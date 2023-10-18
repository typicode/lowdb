# lowdb [![](http://img.shields.io/npm/dm/lowdb.svg?style=flat)](https://www.npmjs.org/package/lowdb) [![Node.js CI](https://github.com/typicode/lowdb/actions/workflows/node.js.yml/badge.svg)](https://github.com/typicode/lowdb/actions/workflows/node.js.yml)

> Simple to use type-safe local JSON database 🦉

```js
// Read or create db.json
const db = await JSONPreset('db.json', { posts: [] })

// Edit db.json content using plain JavaScript
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

[Become a sponsor and have your company logo here](https://github.com/sponsors/typicode) 👉 [GitHub Sponsors](https://github.com/sponsors/typicode)

## Features

- **Lightweight**
- **Minimalist**
- **TypeScript**
- **plain JavaScript**
- Safe atomic writes
- Hackable:
  - Change storage, file format (JSON, YAML, ...) or add encryption via [adapters](#adapters)
  - Extend it with lodash, ramda, ... for super powers!

## Install

```sh
npm install lowdb
```

## Usage

_Lowdb is a pure ESM package. If you're having trouble using it in your project, please [read this](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)._

```js
import { JSONPreset } from 'lowdb/node'

// Read or create db.json
const defaultData = { posts: [] }
const db = await JSONPreset('db.json', defaultData)

// Create and query items using plain JavaScript
db.data.posts.push('hello world')
const firstPost = db.data.posts[0]

// If you don't want to type db.data everytime, you can use destructuring assignment
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

You can use TypeScript to check your data types.

```ts
type Data = {
  messages: string[]
}

const defaultData: Data = { messages: [] }
const db = await JSONFile<Data>('db.json')

db.data.messages.push('foo') // ✅ Success
db.data.messages.push(1) // ❌ TypeScript error
```

### Lodash

You can extend lowdb with Lodash (or other libraries).

```ts
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import lodash from 'lodash'

type Post = {
  id: number
  title: string
}

type Data = {
  posts: Post[]
}

// Extend Low class with a new `chain` field
class LowWithLodash<T> extends Low<T> {
  chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data')
}

const defaultData: Data = {
  posts: [],
}
const adapter = new JSONFile<Data>('db.json', defaultData)
const db = new LowWithLodash(adapter)
await db.read()

// Instead of db.data use db.chain to access lodash API
const post = db.chain.get('posts').find({ id: 1 }).value() // Important: value() must be called to execute chain
```

### CLI, Server, Browser and in tests usage

See [`src/examples/`](src/examples) directory.

## API

### Presets

Lowdb provides four presets for common cases.

- `JSONPreset(filename, defaultData)`
- `JSONSyncPreset(filename, defaultData)`
- `LocalStoragePreset(name, defaultData)`
- `SessionStoragePreset(name, defaultData)`

See [`src/examples/`](src/examples) directory for usage.

Lowdb is extremely flexible, if you need to extend it or modify its behavior, use the classes and adapters below instead of the presets.

### Classes

Lowdb has two classes (for asynchronous and synchronous adapters).

#### `new Low(adapter)`

```js
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

const db = new Low(new JSONFile('file.json'), {})
await db.read()
await db.write()
```

#### `new LowSync(adapterSync)`

```js
import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'

const db = new LowSync(new JSONFileSync('file.json'), {})
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
import { JSONFile, JSONFileSync } from 'lowdb/node'

new Low(new JSONFile(filename), {})
new LowSync(new JSONFileSync(filename), {})
```

#### `Memory` `MemorySync`

In-memory adapters. Useful for speeding up unit tests. See [`src/examples/`](src/examples) directory.

```js
import { Memory, MemorySync } from 'lowdb'

new Low(new Memory(), {})
new LowSync(new MemorySync(), {})
```

#### `LocalStorage` `SessionStorage`

Synchronous adapter for `window.localStorage` and `window.sessionStorage`.

```js
import { LocalStorage, SessionStorage } from 'lowdb/browser'
new LowSync(new LocalStorage(name), {})
new LowSync(new SessionStorage(name), {})
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
  read() {
    /* ... */
  } // should return Promise<data>
  write(data) {
    /* ... */
  } // should return Promise<void>
}

class SyncAdapter {
  read() {
    /* ... */
  } // should return data
  write(data) {
    /* ... */
  } // should return nothing
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
import { Adapter, Low } from 'lowdb'
import { TextFile } from 'lowdb/node'
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
