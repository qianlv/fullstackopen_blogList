const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const testHelper = require('./test_helper')

const User = require('../models/user')


describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('qianlv', 10)
    const user = new User({
      username: 'root',
      passwordHash,
    })

    await user.save()
  })

  test('create one new user', async () => {
    const usersAtStart = await testHelper.usersInDb()
    const user = {
      username: 'Mike',
      name: 'Mike User',
      password: 'newuser123'
    }

    const result = await api
      .post('/api/users')
      .send(user)
      .set('Content-Type', 'application/json')
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await testHelper.usersInDb()

    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(user => user.username)
    const newUser = result.body
    console.log(usernames, newUser)
    assert.ok(usernames.includes(newUser.username))
  })

  test(
    'creation fails with proper statuscode and message if username already taken',
    async () => {
      const usersAtStart = await testHelper.usersInDb()
      const user = {
        username: 'root',
        name: 'rout user',
        password: 'newuser123'
      }

      const result = await api
        .post('/api/users')
        .send(user)
        .set('Content-Type', 'application/json')
        .expect(400)

      assert.ok(result.body.error.includes('expected `username` to be unique'))

      const usersAtEnd = await testHelper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)

    })
})

after(async () => {
  await User.deleteMany({})
  await mongoose.connection.close()
})
