import { MESSAGES } from "../messages";
import { operationTypeEnum } from "../helpers/api-consts-enum";

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

  // Regex para validar UUID v4
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidV4Regex.test(tokenId)) {
    return MESSAGES.VALIDATION.REQUIRED_UUID_FIELD("tokenId");
  }

  if (
    !operationType ||
    typeof operationType !== "string" ||
    operationType.trim() === "" ||
    (operationType !== operationTypeEnum.SELL &&
      operationType !== operationTypeEnum.BUY)
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
