import { Router } from 'express'
import { createToken, listToken, getToken, updateToken, deleteToken } from '../controllers/token.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()

router.post('/', authMiddleware, createToken)
router.get('/', authMiddleware, listToken)
router.get('/:id', authMiddleware, getToken)
router.put('/:id', authMiddleware, updateToken)
router.delete('/:id', authMiddleware, deleteToken)

export default router
