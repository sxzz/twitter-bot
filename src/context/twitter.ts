import { Rettiwt } from 'rettiwt-api'
import type { SessionContext } from './session'
import type { Context, MiddlewareFn } from 'telegraf'

export interface TwitterContext extends Context {
  rettiwt: Rettiwt
}

export const twitterMiddleware: MiddlewareFn<
  SessionContext & TwitterContext
> = (ctx, next) => {
  if (ctx.session?.apiToken) {
    Object.defineProperty(ctx, 'rettiwt', {
      get() {
        return new Rettiwt({
          apiKey: ctx.session!.apiToken,
        })
      },
    })
  }
  return next()
}
