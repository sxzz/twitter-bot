import type { Bot } from '..'
import type { BotCommand } from 'telegraf/types'

export function initClear(bot: Bot): BotCommand {
  const command = 'clear'
  bot.command(command, (ctx) => {
    ctx.session = undefined
    return ctx.reply('已清空所有数据')
  })
  return { command, description: '清空所有数据' }
}
