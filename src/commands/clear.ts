import { CallbackQuery } from '../context/query-callback'
import type { Bot } from '..'
import type { BotCommand } from 'telegraf/types'

export function initClear(bot: Bot): BotCommand {
  const command = 'clear'
  bot.command(command, (ctx) => {
    return ctx.reply('确认清空所有数据吗？', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '确认', callback_data: CallbackQuery.CLEAR_DATA },
            { text: '取消', callback_data: '' },
          ],
        ],
      },
    })
  })

  bot.action(CallbackQuery.CLEAR_DATA, (ctx) => {
    ctx.session = undefined
    return ctx.editMessageText('已清空所有数据')
  })

  return { command, description: '清空所有数据' }
}
