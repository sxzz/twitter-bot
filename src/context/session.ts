import { session, type Context } from 'telegraf'
import { redis, redisGet, redisSet } from '../utils/redis'
import type { AsyncSessionStore } from 'telegraf/session'

export enum State {
  REGISTER_API_KEY,
  SEND_TWEET,
}

export interface Account {
  apiToken: string
  username: string
  id: string
}

export interface SessionData {
  accounts?: Account[]
  currentAccount?: string
  state?: State

  diffKeys?: string[]
  firstDiff?: string

  pendingTweet?: string
}
export interface SessionContext extends Context {
  session?: SessionData
}

const prefix = 'telegraf:'
const store: AsyncSessionStore<any> = {
  get(key) {
    return redisGet(prefix + key)
  },
  set(key, session: unknown) {
    return redisSet(prefix + key, session)
  },
  delete(key) {
    return redis.del(prefix + key)
  },
}

export const sessionMiddleware = session({ store })

export function updateAccount(ctx: SessionContext, account: Account) {
  ctx.session ||= {}
  ctx.session.accounts ||= []

  const idx = ctx.session.accounts.findIndex((acc) => acc.id === account.id)
  if (idx !== -1) {
    ctx.session.accounts[idx] = account
  } else {
    ctx.session.accounts.push(account)
  }
}

export function getCurrentAccount(ctx: SessionContext): Account | null {
  if (!ctx.session?.accounts?.[0]) {
    return null
  }
  const currentAccount = ctx.session.currentAccount
  if (!currentAccount) {
    return null
  }
  return ctx.session.accounts.find((acc) => acc.id === currentAccount) || null
}
