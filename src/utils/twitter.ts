import type { CursoredData, Tweet, User } from 'rettiwt-api'

export async function paginate<T extends Tweet | User>(
  exector: (
    cursor: string | undefined,
    page: number,
  ) => Promise<CursoredData<T>>,
  count: number,
): Promise<T[]> {
  let cursor: string | undefined
  const data: T[] = []
  let page = 1

  while (true) {
    const res = await exector(cursor, page)
    data.push(...res.list)
    cursor = res.next.value
    if (res.list.length < count) break
    page++
  }
  return data
}
