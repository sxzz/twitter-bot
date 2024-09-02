import dedent from 'dedent'
import { Rettiwt } from 'rettiwt-api'
import { State } from '../context/session'
import { plainText } from '../utils/telegram'
import type { Bot } from '..'
import type { BotCommand } from 'telegraf/types'

export function initRegister(bot: Bot): BotCommand {
  const command = 'register'

  bot.command(command, (ctx) => {
    ctx.session ||= {}
    ctx.session.state = State.REGISTER_API_KEY
    return ctx.replyWithMarkdownV2(
      dedent(
        `请提供你推特的 API key，你可以在 [这里](https://github.com/Rishikant181/Rettiwt-API#1-using-a-browser-recommended) 了解如何获取。`,
      ),
    )
  })

  bot.on(plainText, async (ctx, next) => {
    if (ctx.session?.state !== State.REGISTER_API_KEY) return next()

    const apiToken = ctx.message.text.trim()
    if (!apiToken) return ctx.reply('API key 不能为空，请重试。')

    const rettiwt = new Rettiwt({ apiKey: apiToken })
    try {
      await rettiwt.user.recommended()
    } catch {
      return ctx.reply('API key 不正确，请重试。')
    }
    ctx.session.state = undefined
    ctx.session.apiToken = apiToken
    return ctx.reply('你的推特账号已登记')
  })

  return { command, description: '登记你的推特账号至本机器人' }
}
