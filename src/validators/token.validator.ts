import { MESSAGES } from "../messages";

export function validateTokenInput(data: {
  name?: any;
  symbol?: any;
  categoryId?: any;
}): string | null {
  const { name, symbol, categoryId } = data;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return MESSAGES.VALIDATION.REQUIRED_FIELD("name");
  }

  if (!symbol || typeof symbol !== "string" || symbol.trim() === "") {
    return MESSAGES.VALIDATION.REQUIRED_FIELD("symbol");
  }

  if (
    !categoryId ||
    typeof categoryId !== "string" ||
    categoryId.trim() === ""
  ) {
    return MESSAGES.VALIDATION.REQUIRED_FIELD("categoryId");
  }

  return null;
}
