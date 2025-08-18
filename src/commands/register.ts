import dedent from 'dedent'
import { FetcherService } from 'rettiwt-api'
import { RettiwtConfig } from 'rettiwt-api/dist/models/RettiwtConfig.js'
import { State, updateAccount } from '../context/session'
import { plainText } from '../utils/telegram'
import type { Bot } from '..'
import type { AuthCredential } from 'rettiwt-api/dist/models/auth/AuthCredential'
import type { BotCommand } from 'telegraf/types'

interface User {
  avatar_image_url: string
  is_auth_valid: boolean
  is_protected: boolean
  is_suspended: boolean
  is_verified: boolean
  name: string
  screen_name: string
  user_id: string
}

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
    if (ctx.session?.state !== State.REGISTER_API_KEY) {
      return next()
    }

    ctx.session ||= {}

    ctx.sendChatAction('typing')
    const apiToken = ctx.message.text.trim()
    if (!apiToken) return ctx.reply('API key 不能为空，请重试。')

    const config = new RettiwtConfig({ apiKey: apiToken })
    const fetcher = new FetcherService(config)

    let users: User[]
    try {
      const url = 'https://api.x.com/1.1/account/multi/list.json'
      // @ts-expect-error
      const cred: AuthCredential = await fetcher._getCredential()
      // @ts-expect-error
      const transaction = await fetcher._getTransactionHeader('GET', url)
      const headers = {
        ...(cred.toHeader() as any),
        ...transaction,
      }
      const response = (await fetch(url, {
        method: 'GET',
        headers,
      }).then((resp) => resp.json())) as { users: User[] }
      users = response.users
    } catch {
      return ctx.reply('API key 不正确，请重试。')
    }

    for (const user of users) {
      ctx.session.currentAccount ||= user.user_id
      updateAccount(ctx, {
        apiToken,
        username: user.screen_name,
        id: user.user_id,
      })
    }
    return ctx.reply('🎉 登记成功！')
  })

  return { command, description: '登记你的推特账号至本机器人' }
}
