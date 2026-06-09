import { Hono } from 'hono'
import { cors } from 'hono/cors'
const app = new Hono()

// Chaining routes ensures types flow correctly
const routes = app.use(cors()).get('/', (c) => {
  return c.json({
    health:"ok"
  })
})

// Export the type of the entire app/routes chain
export type AppType = typeof routes
export default app