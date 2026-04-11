import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'

const app = new Hono()

// public 以下をそのまま配信
app.use('/*', serveStatic({ root: './public' }))

export default app