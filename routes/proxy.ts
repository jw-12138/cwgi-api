import type {Context} from "hono";

export default async function (c: Context) {
  let api = c.req.param('link')
  let method = c.req.method

  let testURL
  try {
    testURL = new URL(api)
  } catch (e: any) {
    return c.json({
      error: e.message
    }, 400)
  }

  const validHostnames = [
    'api.github.com',
    'avatars.githubusercontent.com'
  ]

  // IMPORTANT: This is a security measure to prevent misuse or abuse,
  //            comment out at your own risk.
  if (!validHostnames.includes(testURL.hostname)) {
    return c.json({
      error: 'Invalid hostname'
    }, 400)
  }

  // some methods might contain body information
  let useBodyList = [
    'POST',
    'PUT',
    'PATCH',
    'DELETE'
  ]

  let body = null

  if (useBodyList.includes(method)) {
    try {
      body = await c.req.json()
      body = JSON.stringify(body)
    } catch (e) {
      body = null
    }
  }

  let remoteHeaders = new Headers()
  const headersWhitelist = [
    'authorization',
    'cookie',
    'user-agent',
    'accept',
    'cache-control',
    'content-type',
    'method',
    'referer',
    'origin'
  ]

  c.req.raw.headers.forEach((value, key) => {
    if (headersWhitelist.includes(key)) {
      remoteHeaders.set(key, value)
    }
  })

  if(!remoteHeaders.get('authorization') && c.env.GITHUB_TOKEN){
    remoteHeaders.set('authorization', `Bearer ${c.env.GITHUB_TOKEN}`)
  }

  let remoteResponse

  try {
    remoteResponse = await fetch(api, {
      method: method,
      headers: remoteHeaders,
      body: body
    })
  } catch (e: any) {
    console.log(e)
    return c.json({
      error: 'GitHub API failed.'
    }, 502)
  }

  return new Response(remoteResponse.body, {
    status: remoteResponse.status,
    headers: remoteResponse.headers
  })
}
