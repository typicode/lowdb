# lowdb

>  Minimalist JSON database for small projects

```js
db.data
  .posts
  .push({ id: 1, title: 'lowdb is awesome'})

db.write()
```

```json
{
  "posts": [
    { "id": 1, "title": "lowdb is awesome" }
  ]
}
```

## Highlights

* Extremely minimalist API
* Query and modify data using plain JS
* TypeScript support out of the box
* Hackable
  * Change storage, file format or add encryption via [adapters](#adapters)
  * Add lodash, ramda, ... for super powers!

## Install

```sh
npm install lowdb
```

<a href="https://www.patreon.com/typicode">
  <img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" width="160">
</a>


## Usage

```js
import Low from 'lowdb/lib/Low'
import JSONFile from 'lowdb/adapters/JSONFile'

const adapter = new JSONFile('db.json')
const db = new Low(adapter)
const defaultData = { messages: [] }

(async () => {

  // Read data from JSON file, this will set db.data 
  await db.read()

  // If db.json doesn't exist, db.data is null
  if (db.data === null) {
  
    // If db.data is null, set some default data
    // db.data can be anything: object, array, string, ...
    db.data = { messages: [] }
    
  }

  // Push new message
  db.data.messages.push('hello world')

  // Write to db.data to db.json
  await db.write()
  
})()
```

```js
// db.json
{
  "messages": [ "hello world" ]
}
```

## API

### Classes

Lowdb comes with 2 classes to be used with asynchronous or synchronous adapters.

#### new Low(adapter)

```js
import Low from 'lowdb/lib/Low'
import JSONFile from 'lowdb/lib/adapters/JSONFile'

const db = new Low(new JSONFile('db.json'))
await db.read()
await db.write()
```

#### new LowSync(adapterSync)

```js
import LowSync from 'lowdb/lib/LowSync'
import JSONFileSync from 'lowdb/lib/adapters/JSONFileSync'

const db = new LowSync(new JSONFileSync('db.json'))
db.read()
db.write()
```

### Methods

#### read()

Calls `adaper.read()` and sets instance `data`.

__Note__ `JSONFile` and `JSONFileSync` adapters will set `data` to `null` if file doesn't exist.

```js
db.data // === undefined
db.read()
db.data // !== undefined
```

#### `write()`

Calls `adapter.write(data)` and passes instance `data`

```js
db.data = { posts: [] }
db.write() // db.json will be { posts: [] }
db.data = {}
db.write() // db.json will be {}
```

### Properties

#### `data`

`data` is your db state. If you're using the adapters coming with lowdb, it can be any type supported by [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).

```js
db.data = 'string'
db.data = [ 1, 2, 3 ]
db.data = { key: 'value' }
```

## Adapters

### Bundled adapters

Lowdb comes with 3 adapters, but you can write your own.

#### lib/adapters/JSONFile

Asynchronous adapter for reading and writng JSON files.

```js
new Low(new JSONFile(file))
```

#### lib/adapters/JSONFile

Synchronous adapter for reading and writng JSON files.

```js
new LowSync(new JSONFileSync(file))
```

#### lib/adapters/LocalStorage

Synchronous adapter for `window.localStorage` use it with `LowSync`.

```
new LowSync(new LocalStorage())
```

## Third-party adapters

* ...
* ...

## Recipes

### Using lowdb with lodash

In this example, we're going to use lodash but you can apply the same principles to other libraries like ramda.

```js
import lodash from lodash

// After db.read, add a new chain property 
db.chain = lodash.chain(db.data)

// And use chain instead of db.data if you want to use the powerful API that lodash provides
db.chain
  .get('messages')
  .first()
  .value()
```

If you're building for the web, and want to make the bundle smaller, you can just use the functions that you need

```js
import find from 'lodash/find'

const message = find(db.data.message, { id: 1 })
```

### Synchronous file operations

If you prefer to write data synchronously, use `LowSync` and `JSONFileSync`

```js
import LowSync from 'lowdb/LowSync'
import JSONFileSync from 'lowdb/JSONFileSync'

const db = new Low(JSONFile('db.json'))

// db.read and db.write will be synchronous
```

### Creating your own adapter

Adapter let's you persist your data to any storage. By default, lowdb comes with `JSONFile`, `JSONFileSync` and `LocalStorage` but you can find on npm third-party adapters to store your data to GitHub, Dat, ...

But creating your own is super simple, your adapter just has to provide the following methods:

```js
// If it's asynchronous
read: () => Promise<void>
write: (data: any) => void

// If it's synchronous
read: () => void
write: (data: any) => void
```

For example, let's say you have some remote storage:

```js
import api from './MyAsyncStorage'

class MyAsyncAdapter {
  // this is optional but your Adapter could take some arguments
  constructor(someArgs) {
    // ...
  }

  read() {
    return api.read() // should return a Promise
  }
  
  write() {
    return api.write() // should return a Promise
  }
}

const adapter = new MyAsyncAdapter()
const db = new Low(adapter)
```

### Using it with TypeScript

Lowdb now comes with definitions files out of the box, but since there's no way of telling what the data will look like you will need to provide an interface via a generic. 

```ts
interface IData {
  messages: string[]
}

const db = new Low<IData>(adapter)
```

## Limits

Lowdb isn't meant to scale and doesn't support Cluster.

If you have large JavaScript objects (`~10-100MB`) you may hit some performance issues. This is because whenever you call `write`, the whole object will be serialized and written to the storage.

This can be fine depending on your projects. It can also be mitigated by doing batch operations and calling `write` only when you need it.

But if you plan to scale, it's highly recommended to use databases like `PostgreSQL`, `MongoDB`, ...

## License

MIT 

[Become a Patron](https://www.patreon.com/typicode) - [Supporters](https://thanks.typicode.com)