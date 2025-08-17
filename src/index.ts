import { Telegraf } from 'telegraf'
import { initClear } from './commands/clear'
import { initDeleteData } from './commands/delete-data'
import { initDiffFollowers } from './commands/diff-followers'
import { initRegister } from './commands/register'
import { initSaveFollowers } from './commands/save-followers'
import { initValuableFollowers } from './commands/valuable-followers'
import { BOT_TOKEN } from './constants'
import { sessionMiddleware, type SessionContext } from './context/session'
import { twitterMiddleware, type TwitterContext } from './context/twitter'
import type { BotCommand } from 'telegraf/types'

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

console.info('Bot starting...')
await bot.launch()
