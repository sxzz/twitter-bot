import { escapeText } from './telegram'
import type { CursoredData, Tweet, User } from 'rettiwt-api'

export async function paginate<T extends Tweet | User>(
  exector: (
    cursor: string | undefined,
    page: number,
    count: number,
  ) => Promise<CursoredData<T>>,
  count: number,
): Promise<T[]> {
  let cursor: string | undefined
  const data: T[] = []
  let page = 1

  while (true) {
    const res = await exector(cursor, page, count)
    data.push(...res.list)
    cursor = res.next.value
    if (res.list.length < count) break
    page++
  }
  return data
}

export function formatUser(user: User) {
  return `[${escapeText(user.fullName)}](${escapeText(`https://x.com/${user.userName}`)})` as const
}
