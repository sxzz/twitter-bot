import { callbackQuery as filterCallbackQuery } from 'telegraf/filters'
import type { Context, MiddlewareFn } from 'telegraf'

export enum CallbackQuery {
  DIFF_FOLLOWERS = '00',
  DIFF_FOLLOWERS_DONE = '01',
  DELETE_DATA = '02',
  SELECT_ACCOUNT = '03',
  CONFIRM_TWEET = '04',
  CLEAR_DATA = '05',
}

export interface QueryCallbackContext extends Context {
  callbackType: CallbackQuery
  callbackData: string
}

export const queryCallbackMiddleware: MiddlewareFn<QueryCallbackContext> = (
  ctx,
  next,
) => {
  if (filterCallbackQuery('data')(ctx.update)) {
    const raw = ctx.update.callback_query.data

    const callbackType = raw.slice(0, 2) as CallbackQuery
    const data = raw.slice(3)

    ctx.callbackType = callbackType
    ctx.callbackData = data
  }

  return next()
}

export function callbackQuery(type: CallbackQuery) {
  return (text: string): RegExpExecArray | null =>
    text.slice(0, 2) === type ? ([] as any) : null
}
