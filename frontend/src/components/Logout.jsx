const Logout = ({setUser}) => {
  const handleLogout = (event) => {
    event.preventDefault()
    window.localStorage.removeItem('loggedBlogAppUser')
    setUser(null)
  }

  return (
    <button onClick={handleLogout}>logout</button>
  )
}

export default Logout
