import { MESSAGES } from '../messages'

export function validateCategoryInput(data: { name?: any, description?: any }) {
  const { name, description } = data;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return MESSAGES.VALIDATION.REQUIRED_FIELD('name');
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    return MESSAGES.VALIDATION.REQUIRED_FIELD('description');
  }

  return null;
}
