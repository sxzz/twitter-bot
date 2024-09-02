import process from 'node:process'
import Redis from 'ioredis'

export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379/0'
export const redis = new Redis(REDIS_URL)
