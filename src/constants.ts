import process from 'node:process'

export enum CallbackQuery {
  DIFF_FOLLOWERS = '00',
  DIFF_FOLLOWERS_DONE = '01',
  DELETE_DATA = '02',
}

export const BOT_TOKEN = process.env.BOT_TOKEN!
export const REDIS_URL = process.env.REDIS_URL!
