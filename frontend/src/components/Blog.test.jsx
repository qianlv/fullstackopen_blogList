import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import Blog from './Blog'
import { expect } from 'vitest'

test('render blog title and author', () => {
  const blog = {
    title: 'test blog',
    author: 'test author',
    url: 'test url',
    likes: 0,
    id: 'jf232j1k13fsk332k4j32k43',
    user: {
      name: 'qianlv',
      username: 'qianlv xiao',
    }
  }

  const emptyFun = () => {}

  render(<Blog blog={blog} likeVote={emptyFun} user={{ username: 'none' }} removeBlog={emptyFun} />)

  const title = screen.getByText('test blog test author')
  expect(title).toBeDefined()
})

test('render blog url and number of likes are shown when the button be clicked', async () => {
  const blog = {
    title: 'test blog',
    author: 'test author',
    url: 'test url',
    likes: 0,
    id: 'jf232j1k13fsk332k4j32k43',
    user: {
      name: 'qianlv',
      username: 'qianlv xiao',
    }
  }
  const mockHandler = vi.fn()
  const emptyFun = () => {}

  render(<Blog blog={blog} likeVote={mockHandler} user={{ username: 'none' }} removeBlog={emptyFun} />)

  const user = userEvent.setup()
  const visibleButton = screen.getByText('view')
  await user.click(visibleButton)

  const url = screen.getByText('test url')
  const likes = screen.getByText('0 likes')
  expect(url).toBeDefined()
  expect(likes).toBeDefined()

  const likeButton = screen.getByText('like')
  await user.click(likeButton)
  expect(mockHandler.mock.calls).toHaveLength(1)
})

test('clicking the button twice calls the event handler twice', async () => {
  const blog = {
    title: 'test blog',
    author: 'test author',
    url: 'test url',
    likes: 0,
    id: 'jf232j1k13fsk332k4j32k43',
    user: {
      name: 'qianlv',
      username: 'qianlv xiao',
    }
  }
  const mockHandler = vi.fn()
  const emptyFun = () => {}

  render(<Blog blog={blog} likeVote={mockHandler} user={{ username: 'none' }} removeBlog={emptyFun} />)

  const user = userEvent.setup()
  const visibleButton = screen.getByText('view')
  await user.click(visibleButton)

  const likeButton = screen.getByText('like')
  await user.click(likeButton)
  await user.click(likeButton)
  expect(mockHandler.mock.calls).toHaveLength(2)
})
