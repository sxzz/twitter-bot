import { Rettiwt } from 'rettiwt-api'
import type { Account, SessionContext } from './session'
import type { Context, MiddlewareFn } from 'telegraf'

export interface TwitterContext extends Context {
  rettiwt: Rettiwt
  account: Account
}

export const twitterMiddleware: MiddlewareFn<
  SessionContext & TwitterContext
> = (ctx, next) => {
  ctx.session ||= {}
  if (!ctx.session.currentAccount) {
    ctx.session.currentAccount = ctx.session.accounts?.[0].id
  }
  const currentAccount = ctx.session.currentAccount
  const account = ctx.session.currentAccount
    ? ctx.session.accounts?.find((account) => account.id === currentAccount)
    : undefined

  if (account) {
    Object.defineProperty(ctx, 'account', {
      get() {
        return account
      },
    })
    Object.defineProperty(ctx, 'rettiwt', {
      get() {
        return new Rettiwt({
          apiKey: account.apiToken,
        })
      },
    })
  }

  return next()
}
