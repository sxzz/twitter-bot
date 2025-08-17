import { session, type Context } from 'telegraf'
import { redis, redisGet, redisSet } from '../utils/redis'
import type { AsyncSessionStore } from 'telegraf/session'

export enum State {
  REGISTER_API_KEY,
  REGISTER_USERNAME,
}

export interface SessionData {
  state?: State
  apiToken?: string
  username?: string
  userid?: string
  diffKeys?: string[]
  firstDiff?: string
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
