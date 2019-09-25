import Koa from 'koa'
import Router from '@koa/router'
import { getPlayers, getAdvancements, getStats, getLang } from './utils'

const app = new Koa()
const router = new Router()

router.get('/players', async ctx => {
  ctx.body = await getPlayers()
})

router.get('/player/:uuid/advancements', async ctx => {
  const { uuid } = ctx.params
  ctx.body = await getAdvancements(uuid)
})

router.get('/player/:uuid/stats', async ctx => {
  const { uuid } = ctx.params
  ctx.body = await getStats(uuid)
})

router.get('/langfile/:code', async ctx => {
  const { code } = ctx.params
  ctx.body = await getLang(code)
})

app
  .use(async (ctx, next) => {
    await next()
    ctx.set('Access-Control-Allow-Origin', '*')
  })
  .use(router.routes())
  .use(router.allowedMethods())

console.log('App start in dir: ', process.cwd())
app.listen(process.env.PORT || 9996)
