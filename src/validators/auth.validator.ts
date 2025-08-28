import { z } from 'zod'
import { MESSAGES } from '../messages'

export const registerSchema = z.object({
  name: z.string().min(2, MESSAGES.USER.INVALID_NAME),
  email: z.string().pipe(z.email(MESSAGES.USER.INVALID_EMAIL)),
  password: z.string().min(6, MESSAGES.USER.INVALID_PASSWORD),
})

export const loginSchema = z.object({
  email: z.string().pipe(z.email(MESSAGES.USER.INVALID_EMAIL)),
  password: z.string().min(6, MESSAGES.USER.INVALID_PASSWORD),
})
