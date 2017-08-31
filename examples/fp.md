# lowdb/lib/fp

__:warning: Experimental__

`lowdb/lib/fp` lets you use [`lodash/fp`](https://github.com/lodash/lodash/wiki/FP-Guide), [`Ramda`](https://github.com/ramda/ramda) or simple JavaScript functions with lowdb.

It can help reducing the size of your `bundle.js`

## Usage

```js
import low from 'lowdb/lib/fp'
import { concat, find, sortBy, take, random } from 'lodash/fp'

const db = low()

// Get posts
const defaultValue = []
const posts = db('posts', defaultValue)

// replace posts with a new array resulting from concat
// and persist database
posts.write(
  concat({ title: 'lowdb is awesome', views: random(0, 5) })
)

// Find post by id
const post = posts(
  find({ id: 1 })
)

// Find top 5 fives posts
const popular = posts([
  sortBy('views'),
  take(5)
])
```

## API

`lowdb/lib/fp` shares the same API as `lowdb` except for the two following methods.

__db(path, [defaultValue])([funcs])__

Returns a new array or object without modifying the database state.

```js
db('posts')(filter({ published: true }))
```

__db(path, [defaultValue]).write([funcs])__

Add `.write` when you want the result to be written back to `path`

```js
db('posts').write(concat(newPost))
db('user.name').write(set('typicode'))
```
