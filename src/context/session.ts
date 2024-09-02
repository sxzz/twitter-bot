import { session, type Context } from 'telegraf'
import { redis } from '../utils/redis'
import type { AsyncSessionStore } from 'telegraf/session'

export enum State {
  REGISTER_API_KEY,
  REGISTER_USERNAME,
}

export interface SessionData {
  state?: State
  apiToken?: string
  username?: string
}
export interface SessionContext extends Context {
  session?: SessionData
}

const prefix = 'telegraf:'
const store: AsyncSessionStore<any> = {
  async get(key) {
    const value = await redis.get(prefix + key)
    return value ? JSON.parse(value) : undefined
  },
  async set(key, session) {
    return await redis.set(prefix + key, JSON.stringify(session))
  },
  async delete(key) {
    return await redis.del(prefix + key)
  },
}

export const sessionMiddleware = session({ store })
