import dedent from 'dedent'
import { callbackQuery } from 'telegraf/filters'
import { CallbackQuery, type Bot } from '..'
import { requireRegister } from '../middleware/require-register'
import { redis } from '../utils/redis'
import { escapeText } from '../utils/telegram'
import { formatUser } from '../utils/twitter'
import type { User } from 'rettiwt-api'
import type { BotCommand, InlineKeyboardButton } from 'telegraf/types'

export function initDiffFollowers(bot: Bot): BotCommand {
  const command = 'diff_followers'
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

    const keys = (await redis.smembers(`followers:${user.id}`)).sort(
      (a, b) => +b.split(':')[2] - +a.split(':')[2],
    )
    if (keys.length < 2) {
      return ctx.reply('没有足够的数据进行比较')
    }

    ctx.session ||= {}
    ctx.session.diffKeys = keys

    return ctx.reply('请选择 2 个数据进行比较', {
      reply_markup: {
        inline_keyboard: genInlineKeyboardButton(keys),
      },
    })
  })

  bot.on(callbackQuery('data'), async (ctx, next) => {
    const token = ctx.callbackQuery.data.slice(0, 2) as CallbackQuery
    const data = ctx.callbackQuery.data.slice(3)
    ctx.session ||= {}

    if (token === CallbackQuery.DIFF_FOLLOWERS) {
      ctx.session.firstDiff = data
      const keys = ctx.session.diffKeys!
      return Promise.all([
        ctx.answerCbQuery('已选择'),
        ctx.editMessageReplyMarkup({
          inline_keyboard: genInlineKeyboardButton(keys, data),
        }),
      ]).catch((error) => ctx.reply(String(error)))
    } else if (token === CallbackQuery.DIFF_FOLLOWERS_DONE) {
      let prevKey = ctx.session.firstDiff
      if (prevKey === data) {
        return ctx.answerCbQuery('请选择不同的数据进行比较')
      }

      ctx.session.firstDiff = undefined
      if (!prevKey) {
        return ctx.editMessageText('未知数据错误')
      }
      let lastKey = data

      let prevDate = new Date(+prevKey.split(':')[2])
      let lastDate = new Date(+lastKey.split(':')[2])
      if (prevDate > lastDate) {
        ;[prevKey, lastKey] = [lastKey, prevKey]
        ;[prevDate, lastDate] = [lastDate, prevDate]
      }

      const [prevFollowers, latestFollowers] = await Promise.all([
        redis.get<User[]>(prevKey),
        redis.get<User[]>(lastKey),
      ])
      if (!prevFollowers || !latestFollowers) {
        return ctx.editMessageText('未知数据错误')
      }

      const newFollowers = latestFollowers.filter(
        (follower) => !prevFollowers.some((f) => f.id === follower.id),
      )
      const lostFollowers = prevFollowers.filter(
        (follower) => !latestFollowers.some((f) => f.id === follower.id),
      )

      if (newFollowers.length === 0 && lostFollowers.length === 0) {
        return ctx.editMessageText('没有新增或失去关注者')
      }

      const newFollowersMsg = newFollowers.map(formatUser).join('\n')
      const lostFollowersMsg = lostFollowers.map(formatUser).join('\n')

      const prevDatetime = escapeText(formatter.format(prevDate))
      const lastDatetime = escapeText(formatter.format(lastDate))

      return ctx.editMessageText(
        dedent(`
          从 ${prevDatetime} 到 ${lastDatetime} 的关注者变化:

          新增关注者 \\(${newFollowers.length}\\):
          ${newFollowersMsg}
  
          失去关注者 \\(${lostFollowers.length}\\):
          ${lostFollowersMsg}
        `),
        {
          parse_mode: 'MarkdownV2',
          link_preview_options: { is_disabled: true },
        },
      )
    }

    return next()
  })

  return { command, description: '比较指定用户的关注者变化' }
}

const formatter = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'medium',
  timeStyle: 'medium',
  timeZone: 'Asia/Shanghai',
})

function genInlineKeyboardButton(
  keys: string[],
  selected?: string,
): InlineKeyboardButton[][] {
  return keys.slice(0, 10).map((key): InlineKeyboardButton[] => [
    {
      text:
        (selected === key ? '✅ ' : '') +
        formatter.format(new Date(+key.split(':')[2])),
      callback_data: `${
        selected
          ? CallbackQuery.DIFF_FOLLOWERS_DONE
          : CallbackQuery.DIFF_FOLLOWERS
      }:${key}`,
    },
  ])
}
