import { MESSAGES } from "../messages";

const operationTypeEnum = {
  BUY: "BUY",
  SELL: "SELL",
} as const;

export function validateTokenBalanceInput(data: {
  tokenId?: any;
  price?: any;
  amount?: any;
  operationType?: any;
  operationAt?: any;
}): string | null {
  const { tokenId, price, amount, operationType, operationAt } = data;

  if (!tokenId || typeof tokenId !== "string" || tokenId.trim() === "") {
    return MESSAGES.VALIDATION.REQUIRED_FIELD("tokenId");
  }

  if (
    !operationType ||
    typeof operationType !== "string" ||
    operationType.trim() === ""
  ) {
    return MESSAGES.VALIDATION.REQUIRED_FIELD("operationType");
  }

  if (price === undefined || typeof price !== "number" || price <= 0) {
    return MESSAGES.VALIDATION.REQUIRED_DECIMAL_FIELD("price");
  }

  if (amount === undefined || typeof amount !== "number" || amount <= 0) {
    return MESSAGES.VALIDATION.REQUIRED_DECIMAL_FIELD("amount");
  }

  return null;
}
