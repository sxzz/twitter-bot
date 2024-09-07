// TODO remove it
import chunk from 'lodash.chunk'
import { requireRegister } from '../middleware/require-register'
import { editMessage } from '../utils/telegram'
import { formatUser, paginate } from '../utils/twitter'
import type { Bot } from '..'
import type { User } from 'rettiwt-api'
import type { BotCommand } from 'telegraf/types'

export function initValuableFollowers(bot: Bot): BotCommand {
  const command = 'valuable_followers'
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

    const msg = await ctx.reply(`正在获取 ${user.fullName} 的关注者`)
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

    followers = followers
      .filter((follower) => follower.followersCount > 0)
      .sort((a, b) => b.followersCount - a.followersCount)

    await editMessage(msg, `共 ${followers.length} 个关注者`)

    const followersGroup = chunk(followers, 20)
    for (const [i, followers] of followersGroup.entries()) {
      const lines = followers.map(
        (follower, index) =>
          `${i * 20 + (index + 1)}\\. ${formatUser(follower)}: ${follower.followersCount}`,
      )
      await ctx.replyWithMarkdownV2(lines.join('\n'), {
        link_preview_options: { is_disabled: true },
      })
    }
  })

  return { command, description: '按粉丝数排序关注列表' }
}
