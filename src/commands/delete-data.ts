import { callbackQuery, CallbackQuery } from '../context/query-callback'
import { requireRegister } from '../middleware/require-register'
import { formatter } from '../utils/date'
import { redis } from '../utils/redis'
import type { Bot } from '..'
import type { BotCommand, InlineKeyboardButton } from 'telegraf/types'

export function initDeleteData(bot: Bot): BotCommand {
  const command = 'delete_data'
  bot.command(command, requireRegister, async (ctx) => {
    try {
      return ctx.reply('请选择要删除的数据', {
        reply_markup: {
          inline_keyboard: await genInlineKeyboardButton(ctx.account.id),
        },
      })
    } catch {
      return ctx.reply('获取数据失败')
    }
  })

  bot.action(
    callbackQuery(CallbackQuery.DELETE_DATA),
    requireRegister,
    async (ctx) => {
      const data = ctx.callbackData
      try {
        await Promise.all([
          redis.del(data),
          redis.srem(`followers:${ctx.account.id}`, data),
        ])
        await Promise.all([
          ctx.answerCbQuery('已删除'),
          ctx.editMessageReplyMarkup({
            inline_keyboard: await genInlineKeyboardButton(ctx.account.id),
          }),
        ])
      } catch (error) {
        return ctx.answerCbQuery(`删除失败\n${error}`)
      }
    },
  )

  return { command, description: '删除数据' }
}

export async function genInlineKeyboardButton(
  userid: string,
): Promise<InlineKeyboardButton[][]> {
  const keys = (await redis.smembers(`followers:${userid}`)).sort(
    (a, b) => +b.split(':')[2] - +a.split(':')[2],
  )
  return keys.slice(0, 10).map((key): InlineKeyboardButton[] => [
    {
      text: formatter.format(new Date(+key.split(':')[2])),
      callback_data: `${CallbackQuery.DELETE_DATA}:${key}`,
    },
  ])
}
