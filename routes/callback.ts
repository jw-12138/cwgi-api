import type {Context} from "hono"

export default async function (c: Context) {
  let code = c.req.query('code')
  let r = c.req.query('r')

  if(!code){
    return c.json({
      error: 'Missing code, are you really GitHub?'
    }, 400)
  }

  let error = c.req.query('error')

  if (error) {
    return c.json({error: error}, 502)
  }

  if (!r) {
    r = c.env.SITE_URL
  }

  let exchangeEndpoint = 'https://github.com/login/oauth/access_token'

  let exchangeAction

  try {
    exchangeAction = await fetch(exchangeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: c.env.GITHUB_CLIENT_ID,
        client_secret: c.env.GITHUB_CLIENT_SECRET,
        code: code
      })
    })
  } catch (e: any) {
    return c.json({
      error: e.message
    }, 502)
  }

  if(!exchangeAction.ok){
    return c.json({
      error: exchangeAction.statusText,
      status: exchangeAction.status
    }, 502)
  }

  let exchangeJson = await exchangeAction.json()

  let redirectedParams = new URLSearchParams({
    access_token: exchangeJson.access_token,
    scope: exchangeJson.scope,
    token_type: exchangeJson.token_type
  })

  return c.redirect(`${r}?${redirectedParams}`, 307)
}
