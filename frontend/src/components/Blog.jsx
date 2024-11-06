import PropTypes from 'prop-types'
import { useState } from 'react'

const Blog = ({ blog, likeVote, user, removeBlog }) => {
  const [visible, setVisible] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  return (
    <div style={blogStyle}>
      {blog.title} | {blog.author}
      {
        visible ?
          <button onClick={() => setVisible(false)}>hide</button> :
          <button onClick={() => setVisible(true)}>view</button>
      }
      {
        visible &&
        <div>
          <div>{blog.url}</div>
          <div>
            {blog.likes} likes
            <button onClick={() => likeVote(blog)}>like</button>
          </div>
          <div>{blog.user.name}</div>
          {blog.user.username === user.username &&
            <button onClick={() => removeBlog(blog.id)}>remove</button>}
        </div>
      }
    </div>
  )
}

Blog.propTypes = {
  blog: PropTypes.object.isRequired,
  likeVote: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  removeBlog: PropTypes.func.isRequired
}

export default Blog
