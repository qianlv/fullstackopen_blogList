import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import BlogForm from './BlogForm'
import { expect } from 'vitest'

test('create new blog is created', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  render(<BlogForm createBlog={createBlog} />)

  const textboxs = screen.getAllByRole('textbox')
  const title = textboxs[0]
  const author = textboxs[1]
  const url = textboxs[2]
  const createButton = screen.getByText('create')

  await user.type(title, 'test title')
  await user.type(author, 'test author')
  await user.type(url, 'http://example.com')
  await user.click(createButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0]).toEqual({
    title: 'test title',
    author: 'test author',
    url: 'http://example.com'
  })
})
