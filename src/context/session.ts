import { Redis } from '@telegraf/session/redis'
import { session, type Context } from 'telegraf'
import { REDIS_URL } from '../utils/redis'

export enum State {
  REGISTER_API_KEY,
}

export interface SessionData {
  state?: State
  apiToken?: string
}
export interface SessionContext extends Context {
  session?: SessionData
}

const store = Redis<any>({
  url: REDIS_URL,
})
export const sessionMiddleware = session({ store })
