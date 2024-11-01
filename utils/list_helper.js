const _ = require('lodash')
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((acc, blog) => acc + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  let fBlog = undefined
  blogs.forEach(blog => {
    if (fBlog === undefined || fBlog.likes < blog.likes) {
      fBlog = blog
    }
  })
  if (fBlog !== undefined) {
    return {
      'title': fBlog.title,
      'author': fBlog.author,
      'likes': fBlog.likes
    }
  }
  return undefined
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return undefined
  }

  const mostBlog = _(_.countBy(blogs, 'author'))
    .entries()
    .maxBy(_.last)
  return {
    'author': mostBlog[0],
    'blogs': mostBlog[1]
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return undefined
  }

  const mostLike = _(_.reduce(blogs, (acc, blog) => {
    if (!Object.prototype.hasOwnProperty.call(acc, blog.author)) {
      acc[blog.author] = 0
    }
    acc[blog.author] += blog.likes
    return acc
  }, {}))
    .entries()
    .maxBy(_.last)
  return mostLike
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}
