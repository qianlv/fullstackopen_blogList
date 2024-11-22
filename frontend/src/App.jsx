import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import LoginForm from './components/LoginForm'
import Logout from './components/Logout'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'
import Togglable from './components/Togglable'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const blogFormRef = useRef()

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])

  const createBlog = async (blogObject) => {
    try {
      blogFormRef.current.toggleVisibility()
      const newBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(newBlog))
      setMessage(`a new blog ${newBlog.title} by ${newBlog.author} added`)
      setTimeout(() => setMessage(null), 5000)
      return true
    } catch (err) {
      setError(err.response.data.error)
      setTimeout(() => setError(null), 5000)
      return false
    }
  }

  const login = async (username, password) => {
    try {
      const user = await loginService.login({
        username, password
      })
      window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      return true
    } catch (err) {
      console.log(err)
      setError(err.response.data.error)
      setTimeout(() => setError(null), 5000)
      return false
    }
  }

  const likeVote = async (blog) => {
    console.log(blog)
    try {
      const newBlog = await blogService.update(blog.id, {
        likes: blog.likes + 1,
      })
      console.log(newBlog)
      setBlogs(blogs.map(b => b.id === blog.id ? newBlog : b))
      return true
    } catch (err) {
      console.log(err)
      setError(err.response.data.error)
      setTimeout(() => setError(null), 5000)
      return false
    }
  }

  const removeBlog = async (id) => {
    console.log(id)
    try {
      await blogService.remove(id)
      setBlogs(blogs.filter(blog => blog.id !== id))
      return true
    } catch (err) {
      console.log(err)
      setError(err.response.data.error)
      setTimeout(() => setError(null), 5000)
      return false
    }
  }

  blogs.sort((a, b) => b.likes - a.likes)

  return (
    <>
      {user === null ?
        <div>
          <h2>log in to application</h2>
          <Notification error={error} message={message} />
          <LoginForm login={login} />
        </div> :
        <div>
          <h2>blogs</h2>
          <Notification error={error} message={message} />
          <p>{user.name} logged in<Logout setUser={setUser} /></p>
          <Togglable buttonLabel='create new' ref={blogFormRef}>
            <BlogForm createBlog={createBlog} />
          </Togglable>
          {blogs.map((blog, i) =>
            <Blog
              key={blog.id}
              blog={blog}
              likeVote={likeVote}
              user={user}
              removeBlog={removeBlog}
            />
          )}
        </div>
      }
    </>
  )
}

export default App
