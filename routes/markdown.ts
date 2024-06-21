// @ts-ignore
import MarkdownIt from 'markdown-it'
import type {Context} from "hono"

const md = MarkdownIt({
  linkify: true
})

/**
 * parse @username to link
 */
let originalTextParser = md.renderer.rules.text
// @ts-ignore
md.renderer.rules.text = function (tokens, idx) {
  let text = tokens[idx].content
  let mentionRegex = /@([a-zA-Z0-9_-]+)/g

  if (mentionRegex.test(text)) {
    // @ts-ignore
    text = text.replace(mentionRegex, (match, username) => {
      return `<a href="https://github.com/${username}">@${username}</a>`
    })

    return text
  }

  return originalTextParser(tokens, idx)
}

export default async function (c: Context) {

  let reqOrigin = c.req.header('origin')

  let envAllowedOrigins = c.env.ALLOWED_ORIGINS ? c.env.ALLOWED_ORIGINS.split(',') : []

  envAllowedOrigins.forEach((origin: string) => {
    try {
      new URL(origin)
    } catch (e) {
      return c.json({
        error: `Invalid ALLOWED_ORIGINS: ${origin}, Origin must be a valid URL.`
      }, 500)
    }
  })

  const allowedOrigins = [
    c.env.SITE_URL,
    ...envAllowedOrigins
  ]

  if (!reqOrigin) {
    try {
      // resolve image request
      reqOrigin = new URL(c.req.header('referer') || '').origin
    } catch (e) {
      reqOrigin = undefined
    }
  }

  if (!allowedOrigins.includes(reqOrigin)) {
    return c.json({
      error: 'Invalid origin'
    }, 400)
  }

  let body

  try {
    body = await c.req.text()
  } catch (e) {

    // @ts-ignore
    return c.text('Error: ' + e.message)
  }

  if (!body) {
    return c.text('')
  }

  let markdown = md.render(body)

  return c.text(
    markdown
  )
}
