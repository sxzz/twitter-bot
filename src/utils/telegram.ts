import { allOf, message } from 'telegraf/filters'
import { bot } from '..'
import type { Convenience, Message, Update } from 'telegraf/types'

export const plainText = allOf(message('text'), (update): update is Update => {
  if (!('message' in update)) return false
  if (!('text' in update.message)) return false
  return !update.message.text.startsWith('/')
})

export function editMessage(
  msg: Message.TextMessage,
  content: string,
  extra?: Convenience.ExtraEditMessageText,
) {
  return bot.telegram.editMessageText(
    msg.chat.id,
    msg.message_id,
    undefined,
    content,
    extra,
  )
}

export function escapeText(text: string) {
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
