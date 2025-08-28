import { prisma } from '../config/prisma'

export async function listCategoriesService(params: {
  name?: string
  description?: string
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
}) {
  const {
    name = '',
    description = '',
    page = 1,
    limit = 10,
    sortBy = 'name',
    order = 'asc',
  } = params

  const where: any = {
    ...(name && { name: { contains: name, mode: 'insensitive' as const } }),
    ...(description && { description: { contains: description, mode: 'insensitive' as const } }),
  }

  const total = await prisma.category.count({ where })

  const data = await prisma.category.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      [sortBy]: order
    }
  })

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data
  }
}

export async function createNewCategory(data: { name: string, description?: string }) {
  return prisma.category.create({
    data,
  })
}

export async function updateCategoryById(data: { id: string, name: string, description: string }) {
  return prisma.category.update({
    where: { id: data.id },
    data: {
      name: data.name,
      description: data.description,
    },
  })
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
  })
}
