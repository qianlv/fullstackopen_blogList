const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')
const { afterEach } = require('node:test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // empty the db here
    await request.post('/api/testing/reset')
    // create a user for the backend here
    await request.post('/api/users', {
      data: {
        username: 'tester',
        name: 'tester User',
        password: '123456'
      }
    })

    await page.goto('')
  })

  test('Login form is shown', async ({ page }) => {
    const username = page.getByRole('textbox').first()
    const password = page.getByRole('textbox').last()
    const login = page.getByRole('button', { name: 'login' })
    await expect(username).toBeVisible()
    await expect(password).toBeVisible()
    await expect(login).toBeVisible()
  })


  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'tester', '123456')
      await expect(page.getByText('tester User logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'tester', 'wrong')
      const errorDiv = page.locator('.error')
      await expect(errorDiv).toContainText('invalid username or password')
      await expect(errorDiv).toHaveCSS('border-style', 'solid')
      await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'tester', '123456')
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'First', 'Tester', 'http://tester.com')
      await createBlog(page, 'Second', 'Tester', 'http://tester.com')
      await createBlog(page, 'Third', 'Tester', 'http://tester.com')
    })

    test('blog can like', async ({ page }) => {
      await createBlog(page, 'First', 'Tester', 'http://tester.com')
      await page.getByRole('button', { name: 'view' }).click()
      await page.getByRole('button', { name: 'like' }).click()
      await expect(page.getByText('1 likes')).toBeVisible()
    })

    test('remove blog', async ({ page }) => {
      await createBlog(page, 'First', 'Tester', 'http://tester.com')
      await page.getByRole('button', { name: 'view' }).click()
      await page.getByRole('button', { name: 'remove' }).click()
      await expect(page.getByText('First Tester')).not.toBeVisible()
    })

    test('blog order by like', async ({ page }) => {
      page.on('console', (msg) => {
        console.log(msg)
      })

      await createBlog(page, 'First', 'Tester', 'http://tester.com')
      await createBlog(page, 'Second', 'Tester', 'http://tester.com')
      await createBlog(page, 'Third', 'Tester', 'http://tester.com')
      const views = page.getByRole('button', { name: 'view' })
      for (let i = 0; i < 3; ++i) {
        await views.first().click()
      }
      const likes = page.getByRole('button', { name: 'like' })
      const blogs = page.getByTestId('blog-testid')
      await likes.nth(1).click()
      await expect(blogs.nth(0)).toContainText('Second Tester')
      await expect(blogs.nth(1)).toContainText('First Tester')
      await expect(blogs.nth(2)).toContainText('Third Tester')

      await likes.nth(1).click()
      await expect(blogs.nth(0)).toContainText('Second Tester')
      await expect(blogs.nth(1)).toContainText('First Tester')

      await expect(blogs.nth(2)).toContainText('Third Tester')
      await likes.nth(1).click()
      await expect(blogs.nth(2)).toContainText('Third Tester')
      await expect(blogs.nth(0)).toContainText('First Tester')
      await expect(blogs.nth(1)).toContainText('Second Tester')

      await likes.nth(2).click()
      await likes.nth(2).click()
      await likes.nth(2).click()
      await expect(blogs.nth(0)).toContainText('Third Tester')
      await expect(blogs.nth(1)).toContainText('First Tester')
      await expect(blogs.nth(2)).toContainText('Second Tester')
    })
  })
})
