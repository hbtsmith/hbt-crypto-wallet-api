import { MESSAGES } from "../messages";
import { directionTypeEnum } from "../helpers/api-consts-enum";

export function validateTokenAlertInput(data: {
  symbol?: any;
  price?: any;
  direction?: any;
}): string | null {
  const { symbol, price, direction } = data;

  if (!symbol || typeof symbol !== "string" || symbol.trim() === "") {
    return MESSAGES.VALIDATION.REQUIRED_FIELD("symbol");
  }

  if (!price || typeof price !== "number" || price <= 0) {
    return MESSAGES.TOKEN_ALERT.INVALID_PRICE;
  }

  if (!direction || typeof direction !== "string") {
    return MESSAGES.VALIDATION.REQUIRED_FIELD("direction");
  }

  if (![directionTypeEnum.CROSS_UP, directionTypeEnum.CROSS_DOWN].includes(direction as any)) {
    return MESSAGES.TOKEN_ALERT.INVALID_DIRECTION;
  }

  return null;
}

export function validateTokenAlertUpdateInput(data: {
  symbol?: any;
  price?: any;
  direction?: any;
  active?: any;
}): string | null {
  const { symbol, price, direction, active } = data;

  if (symbol !== undefined) {
    if (!symbol || typeof symbol !== "string" || symbol.trim() === "") {
      return MESSAGES.VALIDATION.REQUIRED_FIELD("symbol");
    }
  }

  if (price !== undefined) {
    if (!price || typeof price !== "number" || price <= 0) {
      return MESSAGES.TOKEN_ALERT.INVALID_PRICE;
    }
  }

  if (direction !== undefined) {
    if (!direction || typeof direction !== "string") {
      return MESSAGES.VALIDATION.REQUIRED_FIELD("direction");
    }

    if (![directionTypeEnum.CROSS_UP, directionTypeEnum.CROSS_DOWN].includes(direction as any)) {
      return MESSAGES.TOKEN_ALERT.INVALID_DIRECTION;
    }
  }

  if (active !== undefined) {
    if (typeof active !== "boolean") {
      return MESSAGES.VALIDATION.REQUIRED_BOOLEAN_FIELD("active");
    }
  }

  return null;
}
