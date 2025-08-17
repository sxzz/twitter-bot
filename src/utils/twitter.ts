import { scheduler } from 'node:timers/promises'
import {
  TwitterError,
  type CursoredData,
  type Tweet,
  type User,
} from 'rettiwt-api'
import { escapeText } from './telegram'

export async function paginate<T extends Tweet | User>(
  executor: (
    cursor: string | undefined,
    page: number,
    count: number,
    retry: number,
  ) => Promise<CursoredData<T>>,
  count: number,
): Promise<T[]> {
  let cursor: string | undefined
  const data: T[] = []
  let page = 1

  while (true) {
    if (cursor) {
      await scheduler.wait(500)
    }

    let retry = 0
    let res: CursoredData<T> | undefined
    do {
      try {
        res = await executor(cursor, page, count, retry)
      } catch (error) {
        if (error instanceof TwitterError && retry < 3) {
          retry++
          await scheduler.wait(3000)
        } else {
          throw error
        }
      }
    } while (!res)

    data.push(...res.list)
    cursor = res.next
    if (res.list.length < count) {
      break
    }
    page++
  }
  return data
}

export function formatUser(user: User) {
  return `[${escapeText(user.fullName)}](${escapeText(`https://x.com/${user.userName}`)})` as const
}
