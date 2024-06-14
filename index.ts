import { Hono } from 'hono'
import { cors } from 'hono/cors'

import proxy from './routes/proxy.ts'
import callback from "./routes/callback.ts";

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => c.text('Hello CWGI!'))

app.all('/proxy/:link{.*}', proxy)

app.get('/callback', callback)

export default app