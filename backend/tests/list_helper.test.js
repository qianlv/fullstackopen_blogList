const _ = require('lodash')
const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const testHelper = require('./test_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(testHelper.listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('when list empty', () => {
    const result = listHelper.totalLikes([])
    assert.strictEqual(result, 0)
  })

  test('when list multiple blogs', () => {
    const result = listHelper.totalLikes(testHelper.blogs)
    assert.strictEqual(result, 36)
  })
})

describe('favorite blog', () => {
  test('When list empty', () => {
    const result = listHelper.favoriteBlog([])
    assert.strictEqual(result, undefined)
  })

  test('When blogs has only one blog', () => {
    const result = listHelper.favoriteBlog(testHelper.listWithOneBlog)
    assert.deepStrictEqual(result, {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      likes: 5,
    })
  })


  test('When blogs has many top favorites', () => {
    const expecteds = [
      {
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        likes: 12,
      },
      {
        title: 'TDD harms architecture',
        author: 'Robert C. Martin',
        likes: 12,
      }
    ]

    const actual = listHelper.favoriteBlog(testHelper.manyFavoriteBlogs)
    assert.ok(expecteds.some(
      (blog) => JSON.stringify(blog) === JSON.stringify(actual)
    ))
  })
})

describe('most blogs', () => {
  test('When blogs is empty', () => {
    const actual = listHelper.mostBlogs([])
    assert.ok(actual === undefined)
  })

  const blogs = testHelper.blogs
  test('When blogs has only one most blogs', () => {
    const actual = listHelper.mostBlogs(blogs)
    const expected = { author: 'Robert C. Martin', blogs: 3 }
    assert.deepStrictEqual(actual, expected)
  })

  test('When blogs has multiple most blogs, return any one', () => {
    const actual = listHelper.mostBlogs(_.slice(blogs, 0, blogs.length - 1))
    const expecteds = [
      { author: 'Edsger W. Dijkstra', blogs: 2 },
      { author: 'Robert C. Martin', blogs: 2 },
    ]
    assert.ok(expecteds.some(
      (author) => JSON.stringify(author) === JSON.stringify(actual)
    ))
  })
})

describe('most likes', () => {
  test('When blogs is empty', () => {
    const actual = listHelper.mostLikes([])
    assert.ok(actual === undefined)
  })

  const blogs = testHelper.blogs
  test('When blogs is many', () => {
    const actual = listHelper.mostLikes(blogs)
    assert.deepStrictEqual(actual, { author: 'Edsger W. Dijkstra', likes: 17 })
  })
})
