import { objectPick } from '@antfu/utils'
import { requireRegister } from '../middleware/require-register'
import { redis } from '../utils/redis'
import { editMessage } from '../utils/telegram'
import { paginate } from '../utils/twitter'
import type { Bot } from '..'
import type { User } from 'rettiwt-api'
import type { BotCommand } from 'telegraf/types'

export function initSaveFollowers(bot: Bot): BotCommand {
  const command = 'save_followers'
  bot.command(command, requireRegister, async (ctx) => {
    const username = ctx.args[0] || ctx.session?.username
    if (!username) {
      return ctx.reply(
        '请提供一个用户名，或者先使用 /register 登记你的推特账号',
      )
    }

    ctx.sendChatAction('typing')
    const user = await ctx.rettiwt.user.details(username)
    if (!user) return ctx.reply('用户不存在')

    const msg = await ctx.reply(`正在保存 ${user.fullName} 的关注者`)

    // TODO queue this
    let followers: User[] = []
    try {
      followers = await paginate(async (cursor, page) => {
        await editMessage(
          msg,
          `正在保存 ${user.fullName} 的关注者，第 ${page} 页...`,
        )
        return ctx.rettiwt.user.followers(user.id, 50, cursor)
      }, 50)
    } catch (error) {
      return editMessage(msg, `获取关注者失败\n${error}`)
    }

    const simplified = followers
      .map((user) =>
        objectPick(user, ['id', 'fullName', 'userName', 'description']),
      )
      .sort((a, b) => a.id.localeCompare(b.id))

    const key = `followers:${user.id}:${Date.now()}`
    await Promise.all([
      redis.sadd(`followers:${user.id}`, key),
      redis.set(key, simplified),
    ])
    return editMessage(msg, `已保存 ${followers.length} 个关注者。`)
  })

  return { command, description: '保存指定用户的关注者' }
}
