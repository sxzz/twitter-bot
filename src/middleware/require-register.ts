import type { SessionContext } from '../context/session'
import type { TwitterContext } from '../context/twitter'
import type { Middleware, NarrowedContext } from 'telegraf'
import type { Update } from 'telegraf/types'

export const requireRegister: Middleware<
  NarrowedContext<SessionContext & TwitterContext, Update>
> = (ctx, next) => {
  if (
    !ctx.session?.apiToken ||
    !ctx.session?.username ||
    !ctx.session?.userid
  ) {
    return ctx.reply('请先使用 /register 登记你的推特账号')
  }
  return next()
}
