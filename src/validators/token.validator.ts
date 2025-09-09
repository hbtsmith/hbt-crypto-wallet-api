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

  // Regex para validar UUID v4
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidV4Regex.test(categoryId)) {
    return "O campo categoryId deve ser um UUID válido.";
  }

  return null;
}
