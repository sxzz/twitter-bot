import type { Bot } from '..'
import type { BotCommand } from 'telegraf/types'

export function initCancel(bot: Bot): BotCommand {
  const command = 'cancel'
  bot.command(command, (ctx) => {
    ctx.session ||= {}
    ctx.session.state =
      ctx.session.diffKeys =
      ctx.session.firstDiff =
      ctx.session.pendingTweet =
        undefined

    return ctx.reply('已取消当前操作')
  })
  return { command, description: '取消当前操作' }
}
