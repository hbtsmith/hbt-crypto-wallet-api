import { prisma } from '../config/prisma'
import { MESSAGES } from '../messages'

export async function listTokenService(params: {
  name?: string
  symbol?: string
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
}) {
  const {
    name = '',
    symbol = '',
    page = 1,
    limit = 10,
    sortBy = 'name',
    order = 'asc',
  } = params

  const where: any = {
    ...(name && { name: { contains: name, mode: 'insensitive' as const } }),
    ...(symbol && { symbol: { contains: symbol, mode: 'insensitive' as const } }),
  }

  const total = await prisma.token.count({ where })

  const data = await prisma.token.findMany({
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

export async function createTokenService(data: {
  name: string
  symbol: string
  price: number
  amount: number
  acquiredAt: Date
  notes?: string
  categoryId: string
}) {

    let categoryExists = null
    try {
        categoryExists = await prisma.category.findUnique({
            where: { id: data.categoryId },
        })
        
    } catch (error) {
        throw new Error(MESSAGES.CATEGORY.NOT_FOUND)
    }

    if (!categoryExists) {
        throw new Error(MESSAGES.CATEGORY.NOT_FOUND)
    }

    return prisma.token.create({ data })
}

export async function getTokenService(id: string) {
    const token = await prisma.token.findUnique({
        where: { id },
    })
    if (!token) {
        throw new Error(MESSAGES.TOKEN.NOT_FOUND)
    }
    return token
}

export async function updateTokenService(id: string, data: {
  name?: string
  symbol?: string
  price?: number
  amount?: number
  acquiredAt?: Date
  notes?: string
  categoryId?: string
}) {
    const token = await prisma.token.findUnique({
        where: { id },
    })
    if (!token) {
        throw new Error(MESSAGES.TOKEN.NOT_FOUND)
    }
    return prisma.token.update({
        where: { id },
        data,
    })
}

export async function deleteTokenService(id: string) {
    const token = await prisma.token.findUnique({
        where: { id },
    })
    if (!token) {
        throw new Error(MESSAGES.TOKEN.NOT_FOUND)
    }
    return prisma.token.delete({
        where: { id },
    })
}   
