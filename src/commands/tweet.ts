import type { Bot } from '..'
import type { BotCommand } from 'telegraf/types'

export function initTweet(bot: Bot): BotCommand {
  const command = 'tweet'

  return { command, description: '发推' }
}
