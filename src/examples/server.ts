// Note: if you're developing a local server and don't expect to get concurrent requests,
// it can be easier to use `JSONFileSync` adapter.
// But if you need to avoid blocking requests, you can do so by using `JSONFile` adapter.
import express from 'express'
import asyncHandler from 'express-async-handler'

import { JSONFilePreset } from '../presets/node.js'

const app = express()
app.use(express.json())

type Post = {
  id: string
  body: string
}

type Data = {
  posts: Post[]
}

const defaultData: Data = { posts: [] }
const db = await JSONFilePreset<Data>('db.json', defaultData)

// db.data can be destructured to avoid typing `db.data` everywhere
const { posts } = db.data

app.get('/posts/:id', (req, res) => {
  const post = posts.find((p) => p.id === req.params.id)
  res.send(post)
})

app.post(
  '/posts',
  asyncHandler(async (req, res) => {
    const post = req.body as Post
    post.id = String(posts.length + 1)
    await db.update(({ posts }) => posts.push(post))
    res.send(post)
  }),
)

app.listen(3000, () => {
  console.log('listening on port 3000')
})
