import bcrypt from 'bcryptjs'
import { prisma } from '../config/prisma'
import { generateToken } from '../utils/jwt'
import { MESSAGES } from '../messages'

export const registerService = async (name: string, email: string, password: string) => {
  const userExists = await prisma.user.findUnique({ where: { email } })
  if (userExists) throw new Error(MESSAGES.USER.ALREADY_REGISTERED)

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  })

  const token = generateToken({ id: user.id, email: user.email })
  return { token, user }
}

export const loginService = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error(MESSAGES.USER.INVALID_CREDENTIALS)

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new Error(MESSAGES.USER.INVALID_CREDENTIALS)

  const token = generateToken({ id: user.id, email: user.email })
  return { token, user }
}
