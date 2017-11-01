const fs = require('fs')
const tempfile = require('tempfile')
const fp = require('lodash/fp')
const R = require('ramda')
const low = require('../src/fp')
const FileSync = require('../src/adapters/FileSync')

describe('fp + lodash/fp', () => {
  let filename
  let db
  let posts

  beforeEach(() => {
    filename = tempfile()
    db = low(new FileSync(filename))
    posts = db('posts', [])
  })

  it('should support lodash/fp', () => {
    expect(posts(fp.concat(1))).toEqual([1])
    expect(db.getState()).toEqual({})

    expect(posts([fp.concat(1), fp.concat(2)])).toEqual([2, 1])

    posts.write(fp.concat(1))
    expect(db.getState()).toEqual({ posts: [1] })

    const actual = JSON.parse(fs.readFileSync(filename))
    expect(actual).toEqual({ posts: [1] })
  })

  it('should support ramda', () => {
    expect(posts(R.concat([1]))).toEqual([1])
    expect(db.getState()).toEqual({})

    posts.write(R.concat([1]))
    expect(db.getState()).toEqual({ posts: [1] })

    const actual = JSON.parse(fs.readFileSync(filename))
    expect(actual).toEqual({ posts: [1] })
  })
})
