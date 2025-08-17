import { Redis } from 'ioredis'
import { REDIS_URL } from '../constants'

export const redis = new Redis(REDIS_URL)

export async function redisGet<T = any>(key: string) {
  const raw = await redis.get(key)
  if (raw === null) return null!
  return JSON.parse(raw) as T
}

export function redisSet(key: string, data: unknown) {
  return redis.set(key, JSON.stringify(data))
}
