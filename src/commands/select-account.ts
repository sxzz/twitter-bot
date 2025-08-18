import { CallbackQuery, callbackQuery } from '../context/query-callback'
import { requireRegister } from '../middleware/require-register'
import type { Bot } from '..'
import type { Account } from '../context/session'
import type { BotCommand, InlineKeyboardButton } from 'telegraf/types'

export function initSelectAccount(bot: Bot): BotCommand {
  const command = 'select_account'

  bot.command(command, requireRegister, (ctx) => {
    const accounts = ctx.session!.accounts!

    return ctx.reply('请选择一个账号进行操作', {
      reply_markup: {
        inline_keyboard: genInlineKeyboardButton(
          accounts,
          ctx.session!.currentAccount!,
        ),
      },
    })
  })

  bot.action(callbackQuery(CallbackQuery.SELECT_ACCOUNT), (ctx) => {
    ctx.session ||= {}
    ctx.session.currentAccount = ctx.callbackData

    return Promise.all([
      ctx.answerCbQuery('已切换账号'),
      ctx.editMessageReplyMarkup({
        inline_keyboard: genInlineKeyboardButton(
          ctx.session!.accounts!,
          ctx.session!.currentAccount!,
        ),
      }),
    ]).catch(() => {})
  })

  return { command, description: '选择账号' }
}

function genInlineKeyboardButton(
  accounts: Account[],
  selected?: string,
): InlineKeyboardButton[][] {
  return accounts.map((account) => [
    {
      text: (selected === account.id ? '✅ ' : '') + account.username,
      callback_data: `${CallbackQuery.SELECT_ACCOUNT}:${account.id}`,
    },
  ])
}
