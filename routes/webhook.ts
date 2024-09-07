import process from 'node:process'
import { bot } from '~/src'

const SECRET_HASH = process.env.SECRET_HASH!
export default eventHandler(async (evt) => {
  const query = getQuery(evt)
  if (!process.dev && query.secret_hash !== SECRET_HASH) {
    return 'Forbidden'
  }

  const info = await bot.telegram.getWebhookInfo()
  info.url = info.url?.replaceAll(SECRET_HASH, '****')
  return info
})
