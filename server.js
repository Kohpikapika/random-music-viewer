import { serve } from '@hono/node-server'
import app from './src/index.js'

serve({
  fetch: app.fetch,
  port: 3000
})

console.log('http://localhost:3000')