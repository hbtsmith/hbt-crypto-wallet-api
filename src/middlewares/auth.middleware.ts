import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { MESSAGES } from '../messages'
import { JwtPayload } from 'jsonwebtoken'

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: MESSAGES.USER.TOKEN_INVALID })
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: MESSAGES.USER.TOKEN_INVALID })
  }

  try {
    const decoded = verifyToken(token)
    req.user = decoded as string | JwtPayload
    next()
  } catch (err) {
    return res.status(401).json({ message: MESSAGES.USER.TOKEN_INVALID })
  }
}
