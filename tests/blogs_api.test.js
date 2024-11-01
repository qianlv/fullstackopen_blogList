const { test, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const testHelper = require('./test_helper')

const Blog = require('../models/blogs')


beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(testHelper.blogs)
})

test('blog list returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are many blogs', async () => {
  const res = await api.get('/api/blogs')

  assert.strictEqual(res.body.length, testHelper.blogs.length)
})

test('The blogs title', async () => {
  const res = await api.get('/api/blogs')

  const titles = res.body.map((blog) => blog.title)
  assert.ok(titles.includes('React patterns'))
  assert.ok(titles.includes('Go To Statement Considered Harmful'))
})

test('The blogs has id unique identifier property', async () => {
  const res = await api.get('/api/blogs')

  assert.strictEqual(res.body.length, testHelper.blogs.length)
  res.body.forEach(blog => {
    assert.ok(Object.prototype.hasOwnProperty.call(blog, 'id'))
  })
})

test('Add one blogs', async () => {
  const blog = {
    title: 'Test Add one Blog',
    author: 'Test Author',
    url: 'http://example.com',
    likes: 10
  }
  const res = await api
    .post('/api/blogs')
    .send(blog)
    .set('Content-Type', 'application/json')
    .expect(201)
    .expect('Content-Type', /application\/json/)


  const returnedBlog = res.body
  delete returnedBlog.id
  assert.deepStrictEqual(returnedBlog, blog)

  const all = await api.get('/api/blogs')
  assert.strictEqual(all.body.length, testHelper.blogs.length + 1)
})

test(
  'Add one blogs missing likes property, it will set to default value 0',
  async () => {
    const blog = {
      title: 'Test Add one Blog',
      author: 'Test Author',
      url: 'http://example.com',
    }
    const res = await api
      .post('/api/blogs')
      .send(blog)
      .set('Content-Type', 'application/json')
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const returnedBlog = res.body
    delete returnedBlog.id
    blog.likes = 0
    assert.deepStrictEqual(returnedBlog, blog)
  }
)

test(
  'Add one blog missing title, the request will 400 Bad Request',
  async () => {
    const blog = {
      author: 'Test Author',
      url: 'http://example.com',
      likes: 10,
    }

    await api
      .post('/api/blogs')
      .send(blog)
      .set('Content-Type', 'application/json')
      .expect(400)
  }
)

test(
  'Add one blog missing url, the request will 400 Bad Request',
  async () => {
    const blog = {
      title: 'Test Add one Blog',
      author: 'Test Author',
      likes: 10,
    }

    await api
      .post('/api/blogs')
      .send(blog)
      .set('Content-Type', 'application/json')
      .expect(400)
  }
)

after(async () => {
  await mongoose.connection.close()
})
