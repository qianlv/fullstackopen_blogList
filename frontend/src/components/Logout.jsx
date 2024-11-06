import PropTypes from 'prop-types'

const Logout = ({ setUser }) => {
  const handleLogout = (event) => {
    event.preventDefault()
    window.localStorage.removeItem('loggedBlogAppUser')
    setUser(null)
  }

  return (
    <button onClick={handleLogout}>logout</button>
  )
}

Logout.propTypes = {
  setUser: PropTypes.func.isRequired
}

export default Logout
