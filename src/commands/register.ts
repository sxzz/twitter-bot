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
    switch (ctx.session?.state) {
      case State.REGISTER_API_KEY: {
        ctx.sendChatAction('typing')
        const apiToken = ctx.message.text.trim()
        if (!apiToken) return ctx.reply('API key 不能为空，请重试。')

        const rettiwt = new Rettiwt({ apiKey: apiToken })
        try {
          await rettiwt.user.recommended()
        } catch {
          return ctx.reply('API key 不正确，请重试。')
        }
        ctx.session.state = State.REGISTER_USERNAME
        ctx.session.apiToken = apiToken
        return ctx.replyWithMarkdownV2(
          'API key 验证成功，请提供你的推特用户名，例如 `@someone`',
        )
      }
      case State.REGISTER_USERNAME: {
        const username = ctx.message.text.trim()
        if (!username) return ctx.reply('用户名不能为空，请重试。')
        ctx.session.state = undefined
        ctx.session.username =
          username[0] === '@' ? username.slice(1) : username
        return ctx.reply('🎉 登记成功！')
      }
    }

    return next()
  })

  return { command, description: '登记你的推特账号至本机器人' }
}
