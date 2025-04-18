import process from 'node:process'
import { Telegraf } from 'telegraf'
import { initClear } from './commands/clear'
import { initDiffFollowers } from './commands/diff-followers'
import { initRegister } from './commands/register'
import { initSaveFollowers } from './commands/save-followers'
import { initValuableFollowers } from './commands/valuable-followers'
import { sessionMiddleware, type SessionContext } from './context/session'
import { twitterMiddleware, type TwitterContext } from './context/twitter'
import type { BotCommand } from 'telegraf/types'
import { initDeleteData } from './commands/delete-data'

const BOT_TOKEN = process.env.BOT_TOKEN!
export const bot = new Telegraf<SessionContext & TwitterContext>(BOT_TOKEN)
export type Bot = typeof bot

bot.use(sessionMiddleware)
bot.use(twitterMiddleware)

const commands: BotCommand[] = [
  { command: 'start', description: '使用说明' },
  initRegister(bot),
  initSaveFollowers(bot),
  initDiffFollowers(bot),
  initValuableFollowers(bot),
  initClear(bot),
  initDeleteData(bot),
]

const helpMsg = commands
  .map(({ command, description }) => `/${command} - ${description}`)
  .join('\n')
bot.start((ctx) => ctx.reply(helpMsg))
bot.help((ctx) => ctx.reply(helpMsg))
bot.telegram.setMyCommands(commands)

export enum CallbackQuery {
  DIFF_FOLLOWERS = '00',
  DIFF_FOLLOWERS_DONE = '01',
  DELETE_DATA = '02',
}
