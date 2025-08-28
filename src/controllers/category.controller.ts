import { Request, Response } from 'express'
import { listCategoriesService, getCategoryById, createNewCategory, updateCategoryById } from '../services/category.service'
import { validateCategoryInput } from '../validators/category.validator'
import { MESSAGES } from '../messages'

export async function listCategories(req: Request, res: Response) {

  try {
    const {
      name,
      description,
      page = 1,
      limit = 10,
      sortBy = 'name',
      order = 'asc'
    } = req.query

    const result = await listCategoriesService({
      name: String(name || ''),
      description: String(description || ''),
      page: Number(page),
      limit: Number(limit),
      sortBy: String(sortBy),
      order: order === 'desc' ? 'desc' : 'asc'
    })

    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ error: MESSAGES.CATEGORY.ERROR_LIST })
  }


}

export async function createCategory(req: Request, res: Response) {

    const error = validateCategoryInput(req.body);
    if (error) {
        return res.status(400).json({ error });
    }

    const { name, description } = req.body
    const category = await createNewCategory({ name, description })
    res.status(201).json(category)
}

export async function updateCategory(req: Request, res: Response) {
    const { id } = req.params
    if (typeof id !== 'string') {
        return res.status(400).json({ error: MESSAGES.CATEGORY.INVALID_ID })
    }
    const { name, description } = req.body

    const error = validateCategoryInput(req.body);
    if (error) {
        return res.status(400).json({ error });
    }

    const category = await updateCategoryById({ id, name, description })
    if (!category) {
        return res.status(404).json({ error: MESSAGES.CATEGORY.NOT_FOUND })
    }

    res.status(200).json(category)
}

export async function getCategory(req: Request, res: Response) {
    const { id } = req.params
    if (typeof id !== 'string') {
        return res.status(400).json({ error: MESSAGES.CATEGORY.INVALID_ID })
    }
    const category = await getCategoryById(id)
    if (!category) {
        return res.status(404).json({ error: MESSAGES.CATEGORY.NOT_FOUND })
    }
    res.status(200).json(category)
}
