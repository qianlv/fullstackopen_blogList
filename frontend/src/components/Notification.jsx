import PropTypes from 'prop-types'

const Notification = ({ message, error }) => {
  console.log('Notification ', message, error)
  if (message === null && error === null) {
    return
  }

  const showMessage = message === null ? error : message
  const className = message === null ? 'error' : 'message'

  return (
    <div className={className}>
      {showMessage}
    </div>
  )
}

Notification.propTypes = {
  message: PropTypes.string,
  error: PropTypes.string
}

export default Notification
