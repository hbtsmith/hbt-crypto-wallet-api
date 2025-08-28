import { Router } from 'express'
import { createToken, listToken, getToken, updateToken, deleteToken } from '../controllers/token.controller'

const router = Router()

router.post('/', createToken)
router.get('/', listToken)
router.get('/:id', getToken)
router.put('/:id', updateToken)
router.delete('/:id', deleteToken)

export default router
