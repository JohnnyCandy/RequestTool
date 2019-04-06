const Koa = require('koa')
const app = new Koa()
app.use(async (ctx, next) =>{
ctx.body = 'HI 歡迎來到Koa的世界'
})
app.listen(6688)