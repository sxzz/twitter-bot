import { message } from 'telegraf/filters'
import { CallbackQuery } from '../context/query-callback'
import { State, type SessionContext } from '../context/session'
import { escapeText } from '../utils/telegram'
import type { Bot } from '..'
import type { BotCommand } from 'telegraf/types'

export function initTweet(bot: Bot): BotCommand {
  const command = 'tweet'

  bot.command(command, (ctx) => {
    ctx.session ||= {}
    ctx.session.state = State.SEND_TWEET
    if (ctx.payload.trim()) {
      return sendPreview(ctx.payload.trim(), ctx)
    }
    return ctx.reply('请输入要发送的推文内容')
  })

  bot.on(message('text'), (ctx, next) => {
    if (ctx.session?.state !== State.SEND_TWEET) {
      return next()
    }

    ctx.session.state = undefined
    return sendPreview(ctx.message.text, ctx)
  })

  bot.action(`${CallbackQuery.CONFIRM_TWEET}:y`, async (ctx) => {
    const text = ctx.session!.pendingTweet
    ctx.session!.pendingTweet = undefined

    await ctx.rettiwt.tweet.post({
      text,
    })
    return ctx.editMessageText('推文已发送')
  })

  bot.action(`${CallbackQuery.CONFIRM_TWEET}:n`, (ctx) => {
    ctx.session!.pendingTweet = undefined
    return ctx.editMessageText('推文已取消')
  })

  return { command, description: '发推' }
}

function sendPreview(text: string, ctx: SessionContext) {
  ctx.session!.pendingTweet = text

  return ctx.reply(`你发送的推文内容是：${escapeText(text)}`, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '确认',
            callback_data: `${CallbackQuery.CONFIRM_TWEET}:y`,
          },
          {
            text: '取消',
            callback_data: `${CallbackQuery.CONFIRM_TWEET}:n`,
          },
        ],
      ],
    },
  })
}
