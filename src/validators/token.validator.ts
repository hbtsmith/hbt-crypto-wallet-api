import { MESSAGES } from '../messages'

export function validateTokenInput(data: {
  name?: any
  symbol?: any
  price?: any
  amount?: any
  acquiredAt?: any
  notes?: any
  categoryId?: any
}) {
  const { name, symbol, price, amount, acquiredAt, categoryId } = data

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return MESSAGES.VALIDATION.REQUIRED_FIELD('name');
  }

  if (!symbol || typeof symbol !== 'string' || symbol.trim() === '') {
    return MESSAGES.VALIDATION.REQUIRED_FIELD('symbol');
  }

  if (price === undefined || typeof price !== 'number' || price <= 0) {
    return MESSAGES.VALIDATION.REQUIRED_DECIMAL_FIELD('price');
  }

  if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
    return MESSAGES.VALIDATION.REQUIRED_DECIMAL_FIELD('amount');
  }

  if (!acquiredAt || isNaN(Date.parse(acquiredAt))) {
    return MESSAGES.VALIDATION.REQUIRED_DATE_FIELD('acquiredAt');
  }

  if (!categoryId || typeof categoryId !== 'string' || categoryId.trim() === '') {
    return MESSAGES.VALIDATION.REQUIRED_FIELD('categoryId');
  }

  return null
}
