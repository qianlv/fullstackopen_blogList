const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const testHelper = require('./test_helper')

const Blog = require('../models/blog')
const User = require('../models/user')

describe('When there is initally some blogs saved', () => {

  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('123456', 10)
    const user = new User({
      username: 'root',
      passwordHash,
    })
    const user2 = new User({
      username: 'root2',
      passwordHash
    })

    const savedUser = await user.save()
    const savedUser2 = await user2.save()

    const tasks = testHelper.blogs.map((blog, index) => {
      if (index === 0) {
        blog.user = savedUser._id
      } else {
        blog.user = savedUser2._id
      }
      blog = new Blog(blog)
      return blog.save()
    })
    const savedBlogs = await Promise.all(tasks)
    savedUser.blogs = [savedBlogs[0]._id]
    savedUser2.blogs = savedBlogs.slice(1).map(blog => blog._id)
    await savedUser.save()
  })

  test('blog list returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const res = await api.get('/api/blogs')

    assert.strictEqual(res.body.length, testHelper.blogs.length)
  })

  test('A blog is within the returned blogs', async () => {
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

  describe('addition of a new blog', () => {

    test('Add one blogs', async () => {
      const blogsAtStart = await testHelper.blogsInDb()
      const blog = {
        title: 'Test Add one Blog',
        author: 'Test Author',
        url: 'http://example.com',
        likes: 10,
      }

      await api
        .post('/api/blogs')
        .send(blog)
        .set('Content-Type', 'application/json')
        .set('Authorization', await testHelper.userToken())
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await testHelper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1)
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
          .set('Authorization', await testHelper.userToken())
          .expect(201)
          .expect('Content-Type', /application\/json/)

        assert.strictEqual(res.body.likes, 0)
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
          .set('Authorization', await testHelper.userToken())
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
          .set('Authorization', await testHelper.userToken())
          .expect(400)
      }
    )

    test(
      'Add one blog, without token, with 401 status code',
      async () => {
        const blog = {
          title: 'Test Add one Blog',
          author: 'Test Author',
          url: 'http://example.com',
          likes: 10,
        }

        await api
          .post('/api/blogs')
          .send(blog)
          .set('Content-Type', 'application/json')
          .expect(401)
          .expect('Content-Type', /application\/json/)
      }
    )
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogs = await testHelper.blogsInDb()
      const userId = await testHelper.userRootId()
      const toDeletedBlog = blogs.find(blog => blog.user.toString() === userId.toString())
      await api
        .delete(`/api/blogs/${toDeletedBlog.id}`)
        .set('Authorization', await testHelper.userToken())
        .expect(204)

      const blogsAfterDeleted = await testHelper.blogsInDb()
      assert.strictEqual(blogs.length, blogsAfterDeleted.length + 1)

      const titles = blogsAfterDeleted.map(blog => blog.title)
      assert.ok(!titles.includes(toDeletedBlog.title))
    })

    test('failed with status code 401 without token if delete user blog', async () => {
      const blogs = await testHelper.blogsInDb()
      const userId = await testHelper.userRootId()
      const toDeletedBlog = blogs.find(blog => blog.user.toString() === userId.toString())
      await api
        .delete(`/api/blogs/${toDeletedBlog.id}`)
        .expect(401)
    })


    test('failed with status code 403 if delete other user blog', async () => {
      const blogs = await testHelper.blogsInDb()
      const userId = await testHelper.userRootId()
      const toDeletedBlog = blogs.find(blog => blog.user.toString() === userId.toString())
      await api
        .delete(`/api/blogs/${toDeletedBlog.id}`)
        .set('Authorization', await testHelper.userToken('root2'))
        .expect(403)

      const blogsAfterDeleted = await testHelper.blogsInDb()
      assert.strictEqual(blogs.length, blogsAfterDeleted.length)
    })
  })

  describe('update of a blog', () => {
    test('succeeds one blog', async () => {
      const blogs = await testHelper.blogsInDb()
      const userId = await testHelper.userRootId()
      const toUpdateBlog = blogs.find(blog => blog.user.toString() === userId.toString())
      toUpdateBlog.title = 'Update one a blog'

      await api
        .put(`/api/blogs/${toUpdateBlog.id}`)
        .send(toUpdateBlog)
        .set('Content-Type', 'application/json')
        .set('Authorization', await testHelper.userToken())
        .expect(200)

      const updateAtEnd = await Blog.findById(toUpdateBlog.id)
      assert.deepStrictEqual(toUpdateBlog, updateAtEnd.toJSON())
    })

    // test('failed with status code 401 without token if update user blog', async () => {
    //   const blogs = await testHelper.blogsInDb()
    //   const userId = await testHelper.userRootId()
    //   const toUpdateBlog = blogs.find(blog => blog.user.toString() === userId.toString())
    //   toUpdateBlog.title = 'Update one a blog'
    //
    //   await api
    //     .put(`/api/blogs/${toUpdateBlog.id}`)
    //     .send(toUpdateBlog)
    //     .set('Content-Type', 'application/json')
    //     .expect(401)
    // })
    //
    // test('failed with status code 403 if update other user blog', async () => {
    //   const blogs = await testHelper.blogsInDb()
    //   const userId = await testHelper.userRootId()
    //   const toUpdateBlog = blogs.find(blog => blog.user.toString() === userId.toString())
    //   const oldTitle = toUpdateBlog.title
    //   toUpdateBlog.title = 'Update one a blog'
    //
    //   await api
    //     .put(`/api/blogs/${toUpdateBlog.id}`)
    //     .send(toUpdateBlog)
    //     .set('Content-Type', 'application/json')
    //     .set('Authorization', await testHelper.userToken('root2'))
    //     .expect(403)
    //
    //   const updateAtEnd = await Blog.findById(toUpdateBlog.id)
    //   assert.strictEqual(updateAtEnd.title, oldTitle)
    // })

  })

})

after(async () => {
  await mongoose.connection.close()
})
