import { useState } from "react"
import blogService from '../services/blogs'

const BlogForm = ({ blogs, setBlogs, setError, setMessage }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const handleCreate = async (event) => {
    event.preventDefault()

    try {
      const newBlog = await blogService.create({
        title,
        author,
        url
      })
      setBlogs(blogs.concat(newBlog))
      setTitle('')
      setAuthor('')
      setUrl('')
      setMessage(`a new blog ${title} by ${author} added`)
      setTimeout(() => setMessage(null), 5000)
    } catch (err) {
      console.log(err)
      setError(err.response.data.error)
      setTimeout(() => setError(null), 5000)
    }
  }

  return (
    <form onSubmit={handleCreate}>
      <div>
        title:
        <input
          type='text'
          value={title}
          name='Title'
          onChange={({ target }) => setTitle(target.value)}
        />
      </div>
      <div>
        author:
        <input
          type='text'
          value={author}
          name='Author'
          onChange={({ target }) => setAuthor(target.value)}
        />
      </div>
      <div>
        url:
        <input
          type='url'
          value={url}
          name='URL'
          onChange={({ target }) => setUrl(target.value)}
        />
      </div>
      <button type='submit'>create</button>
    </form>
  )
}

export default BlogForm
