import dedent from 'dedent'
import { redis } from '../utils/redis'
import { editMessage } from '../utils/telegram'
import type { Bot } from '..'
import type { User } from 'rettiwt-api'
import type { BotCommand } from 'telegraf/types'

export function initDiffFollowers(bot: Bot): BotCommand {
  const command = 'diff_followers'
  bot.command(command, async (ctx) => {
    if (!ctx.session?.apiToken)
      return ctx.reply('请先使用 /register 登记你的推特账号')
    if (ctx.args.length !== 1) {
      return ctx.reply('请提供一个用户名')
    }

    const msg = await ctx.reply('正在处理，请稍候...')
    const username = ctx.args[0]
    const user = await ctx.rettiwt.user.details(username)
    if (!user) return editMessage(msg, '用户不存在')

    const keyList = (await redis.smembers(`followers:${user.id}`)).sort(
      (a, b) => +b.split(':')[2] - +a.split(':')[2],
    )
    if (keyList.length < 2) {
      return editMessage(msg, '没有足够的数据进行比较')
    }
    const [latestKey, prevKey] = keyList.slice(0, 2)
    const [prevFollowersRaw, latestFollowersRaw] = await Promise.all([
      redis.get(prevKey),
      redis.get(latestKey),
    ])
    if (!prevFollowersRaw || !latestFollowersRaw) {
      return editMessage(msg, '未知数据错误')
    }

    const prevFollowers: User[] = JSON.parse(prevFollowersRaw)
    const latestFollowers: User[] = JSON.parse(latestFollowersRaw)

    const newFollowers = latestFollowers.filter(
      (follower) => !prevFollowers.some((f) => f.id === follower.id),
    )
    const lostFollowers = prevFollowers.filter(
      (follower) => !latestFollowers.some((f) => f.id === follower.id),
    )

    if (newFollowers.length === 0 && lostFollowers.length === 0) {
      return editMessage(msg, '没有新增或失去关注者')
    }

    const newFollowersMsg = newFollowers.map(formatUser).join('\n')
    const lostFollowersMsg = lostFollowers.map(formatUser).join('\n')

    return editMessage(
      msg,
      dedent(`
        新增关注者 \\(${newFollowers.length}\\):
        ${newFollowersMsg}

        失去关注者 \\(${lostFollowers.length}\\):
        ${lostFollowersMsg}
      `),
      {
        link_preview_options: { is_disabled: true },
        parse_mode: 'MarkdownV2',
      },
    )
  })

  return { command, description: '比较指定用户的关注者变化' }
}

function formatUser(user: User) {
  return `[${escapeText(user.fullName)}](${escapeText(`https://x.com/${user.userName}`)})`
}

function escapeText(text: string) {
  return text
    .replaceAll('_', String.raw`\_`)
    .replaceAll('*', String.raw`\*`)
    .replaceAll('[', String.raw`\[`)
    .replaceAll(']', String.raw`\]`)
    .replaceAll('(', String.raw`\(`)
    .replaceAll(')', String.raw`\)`)
    .replaceAll('~', String.raw`\~`)
    .replaceAll('`', '\\`')
    .replaceAll('>', String.raw`\>`)
    .replaceAll('#', String.raw`\#`)
    .replaceAll('+', String.raw`\+`)
    .replaceAll('-', String.raw`\-`)
    .replaceAll('=', String.raw`\=`)
    .replaceAll('|', String.raw`\|`)
    .replaceAll('{', String.raw`\{`)
    .replaceAll('}', String.raw`\}`)
    .replaceAll('.', String.raw`\.`)
    .replaceAll('!', String.raw`\!`)
}
