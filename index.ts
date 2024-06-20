import { Hono } from 'hono'
import { cors } from 'hono/cors'

import proxy from './routes/proxy.ts'
import callback from "./routes/callback.ts";
import markdown from "./routes/markdown.ts";

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => c.text('Hello CWGI!'))

app.all('/proxy/:link{.*}', proxy)

app.post('/markdown', markdown)

app.get('/callback', callback)

export default app
