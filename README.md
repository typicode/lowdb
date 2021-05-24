# lowdb [![](http://img.shields.io/npm/dm/lowdb.svg?style=flat)](https://www.npmjs.org/package/lowdb) [![Node.js CI](https://github.com/typicode/lowdb/actions/workflows/node.js.yml/badge.svg)](https://github.com/typicode/lowdb/actions/workflows/node.js.yml)

> Tiny local JSON database for small projects 🦉

```js
db.data.posts.push({ id: 1, title: 'lowdb is awesome' })
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

## Free for Open Source

To help with OSS funding, lowdb v2 is released under Parity license for a limited time. It'll be released under MIT license once the __goal of 100 [sponsors](https://github.com/sponsors/typicode)__ is reached (currently at 57) or in five months.

Meanwhile, lowdb v2 can be freely used in Open Source projects. Sponsors can use it in any type of project.

If you've installed this new version without knowing about the license change, you're excused for 30 days. There's also a 30 days trial. See license files for more details.

Thank you for your support!

__Note:__ if you're already sponsoring [husky](https://github.com/typicode/husky), you can use lowdb v2 today :)

## Companies

[Become a sponsor and have your company logo here](https://github.com/sponsors/typicode).

## Features

- __Lightweight__
- __Minimalist__ and easy to learn API
- Query and modify data using __plain JS__
- Improved __TypeScript__ support
- Atomic write
- Hackable:
  - Change storage, file format (JSON, YAML, ...) or add encryption via [adapters](#adapters)
  - Add lodash, ramda, ... for super powers!

## Install

```sh
npm install lowdb
```

## Usage

```js
import { join } from 'path'
import { Low, JSONFile } from 'lowdb'

// Use JSON file for storage
const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

// Read data from JSON file, this will set db.data content
await db.read()

// If file.json doesn't exist, db.data will be null
// Set default data
db.data ||= { posts: [] }

// Create and query items using plain JS
db.data.posts.push('hello world')
db.data.posts[0]

// You can also use this syntax if you prefer
const { posts } = db.data
posts.push('hello world')

// Write db.data content to db.json
await db.write()
```

```js
// db.json
{
  "posts": [ "hello world" ]
}
```

### TypeScript

Lowdb now comes with TypeScript support. You can even type `db.data` content.

```ts
type Data = {
  posts: string[] // Expect posts to be an array of strings
}
const adapter = new JSONFile<Data>('db.json')
const db = new Low<Data>(adapter)

db.data
  .posts
  .push(1) // TypeScript error 🎉
```

### Lodash

You can easily add lodash or other utility libraries to improve lowdb.

```js
import lodash from lodash

// ...
// Note: db.data needs to be initialized before lodash.chain is called.
db.chain = lodash.chain(db.data)

// Instead of db.data, you can now use db.chain if you want to use the powerful API that lodash provides
const post = db.chain
  .get('posts')
  .find({ id: 1 })
  .value()
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

Calls `adaper.read()` and sets `db.data`.

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
import { Adapter, Low, TextFile } from 'Low.js'
import YAML from 'yaml'

export class YAMLFile {
  private adapter

  constructor(filename: string) {
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

If you have large JavaScript objects (`~10-100MB`) you may hit some performance issues. This is because whenever you call `db.write`, the whole `db.data` is serialized and written to storage.

Depending on your use case, this can be fine or not. It can be mitigated by doing batch operations and calling `db.write` only when you need it. 

If you plan to scale, it's highly recommended to use databases like PostgreSQL, MongoDB, ... 

## License

[License Zero Parity 7.0.0](https://paritylicense.com/versions/7.0.0.html) and MIT (contributions) with exception [License Zero Patron 1.0.0](https://patronlicense.com/versions/1.0.0).
