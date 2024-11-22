const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')


usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    url: 1, title: 1, author: 1
  })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body
  console.log('body ', request.body)

  if (!password || password.length < 3) {
    response.status(400).json({
      error: '`password` is shorter than the minimum allowed length (3).'
    })
  }

  const saltRound = 10
  const passwordHash = await bcrypt.hash(password, saltRound)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const newUser = await user.save()
  response.status(201).json(newUser)
})

module.exports = usersRouter
