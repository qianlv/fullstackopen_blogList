const loginWith = async (page, username, password) => {
  await page.getByRole('button', { name: 'login' }).click()
  await page.getByRole('textbox').first().fill(username)
  await page.getByRole('textbox').last().fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, title, author, url) => {
  await page.getByRole('button', { name: 'create new' }).click()
  const buttons = await page.getByRole('textbox').all()
  await buttons[0].fill(title)
  await buttons[1].fill(author)
  await buttons[2].fill(url)
  await page.getByRole('button', { name: 'create' }).click()
  await page.getByText(`${title} ${author}`).waitFor()
}

export {
  loginWith, createBlog
}
