import { Router } from 'express'
import { listCategories, getCategory, createCategory, updateCategory } from '../controllers/category.controller'

const router = Router()

router.get('/', listCategories)
router.get('/:id', getCategory)
router.post('/', createCategory)
router.put('/:id', updateCategory)

export default router
