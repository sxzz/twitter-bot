import dedent from 'dedent'
import { redis } from '../utils/redis'
import { formatUser } from '../utils/twitter'
import type { Bot } from '..'
import type { User } from 'rettiwt-api'
import type { BotCommand } from 'telegraf/types'

export function initDiffFollowers(bot: Bot): BotCommand {
  const command = 'diff_followers'
  bot.command(command, async (ctx) => {
    if (!ctx.session?.apiToken)
      return ctx.reply('请先使用 /register 登记你的推特账号')
    const username = ctx.args[0] || ctx.session?.username
    if (!username) {
      return ctx.reply(
        '请提供一个用户名，或者先使用 /register 登记你的推特账号',
      )
    }

    ctx.sendChatAction('typing')
    const user = await ctx.rettiwt.user.details(username)
    if (!user) return ctx.reply('用户不存在')

    const keyList = (await redis.smembers(`followers:${user.id}`)).sort(
      (a, b) => +b.split(':')[2] - +a.split(':')[2],
    )
    if (keyList.length < 2) {
      return ctx.reply('没有足够的数据进行比较')
    }

    // TODO choose data to compare
    const [latestKey, prevKey] = keyList.slice(0, 2)
    const [prevFollowers, latestFollowers] = await Promise.all([
      redis.get<User[]>(prevKey),
      redis.get<User[]>(latestKey),
    ])
    if (!prevFollowers || !latestFollowers) {
      return ctx.reply('未知数据错误')
    }

    const newFollowers = latestFollowers.filter(
      (follower) => !prevFollowers.some((f) => f.id === follower.id),
    )
    const lostFollowers = prevFollowers.filter(
      (follower) => !latestFollowers.some((f) => f.id === follower.id),
    )

    if (newFollowers.length === 0 && lostFollowers.length === 0) {
      return ctx.reply('没有新增或失去关注者')
    }

    const newFollowersMsg = newFollowers.map(formatUser).join('\n')
    const lostFollowersMsg = lostFollowers.map(formatUser).join('\n')

    return ctx.replyWithMarkdownV2(
      dedent(`
        新增关注者 \\(${newFollowers.length}\\):
        ${newFollowersMsg}

        失去关注者 \\(${lostFollowers.length}\\):
        ${lostFollowersMsg}
      `),
      { link_preview_options: { is_disabled: true } },
    )
  })

  return { command, description: '比较指定用户的关注者变化' }
}
