const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })
  console.log(user, await bcrypt.compare(password, user.passwordHash))
  const passwordCorrect = (user === null)
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!passwordCorrect) {
    response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userToken = {
    username,
    id: user._id
  }

  const token = jwt.sign(userToken, process.env.SECRET)

  response.status(200).send({
    token, username: user.username, name: user.name
  })
})

module.exports = loginRouter
