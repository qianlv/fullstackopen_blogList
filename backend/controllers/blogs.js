const blogsRouter = require('express').Router()
const middleware = require('../utils/middleware')
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

// blogsRouter.get('/', middleware.userExtractor, async (request, response) => {
//   const user = request.user
//   const blogs = await Blog
//     .find({ user: user._id })
//     .populate('user', { username: 1, name: 1 })
//
//   response.json(blogs)
// })
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id,
  })
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const user = request.user
  const id = request.params.id
  const toRemoveBlog = await Blog.findById(id)
  if (toRemoveBlog.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'Forbidden' })
  }
  await toRemoveBlog.deleteOne()
  response.status(204).end()
})

blogsRouter.put('/:id', middleware.userExtractor, async (request, response) => {
  const id = request.params.id
  const user = request.user
  const toUpdateBlog = await Blog.findById(id)
  if (toUpdateBlog.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'Forbidden' })
  }
  const updatedBlog = await Blog.findByIdAndUpdate(id, request.body, { new: true })
  response.json(updatedBlog)
})

module.exports = blogsRouter
