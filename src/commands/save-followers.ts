import { objectPick } from '@antfu/utils'
import { redis } from '../utils/redis'
import { editMessage } from '../utils/telegram'
import { paginate } from '../utils/twitter'
import type { Bot } from '..'
import type { BotCommand } from 'telegraf/types'

export function initSaveFollowers(bot: Bot): BotCommand {
  const command = 'save_followers'
  bot.command(command, async (ctx) => {
    if (!ctx.session?.apiToken)
      return ctx.reply('请先使用 /register 登记你的推特账号')
    if (ctx.args.length !== 1) {
      return ctx.reply('请提供一个用户名')
    }
    const username = ctx.args[0]

    const user = await ctx.rettiwt.user.details(username)
    if (!user) return ctx.reply('用户不存在')

    const msg = await ctx.reply(`正在保存 ${user.fullName} 的关注者`)
    const followers = await paginate(async (cursor, page) => {
      await editMessage(
        msg,
        `正在保存 ${user.fullName} 的关注者，第 ${page} 页...`,
      )
      return ctx.rettiwt.user.followers(user.id, 50, cursor)
    }, 50)

    const simplified = followers
      .map((user) =>
        objectPick(user, ['id', 'fullName', 'userName', 'description']),
      )
      .sort((a, b) => a.id.localeCompare(b.id))

    const key = `followers:${user.id}:${Date.now()}`
    await Promise.all([
      redis.sadd(`followers:${user.id}`, key),
      redis.set(key, JSON.stringify(simplified)),
    ])
    return editMessage(msg, `已保存 ${followers.length} 个关注者。`)
  })

  return { command, description: '保存指定用户的关注者' }
}
