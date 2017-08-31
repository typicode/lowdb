const lodashId = require('lodash-id')
const Memory = require('../src/adapters/Memory')
const low = require('../src/main')

describe('mixin', () => {
  let db

  beforeEach(() => {
    db = low(new Memory())
  })

  it('should allow adding functions', () => {
    db._.mixin({
      hello: (array, word) => array.push('hello ' + word)
    })

    db
      .set('msg', [])
      .get('msg')
      .hello('world')
      .write()

    expect(db.getState().msg).toEqual(['hello world'])
  })

  it('should support lodash-id', () => {
    db.defaults({ posts: [] }).value()

    db._.mixin(lodashId)
    db._.id = '_id'

    const posts = db.get('posts')

    const id = posts.insert({ title: 'test' }).write()._id

    const post = db
      .get('posts')
      .getById(id)
      .value()

    expect(post).not.toBeUndefined()
  })
})
