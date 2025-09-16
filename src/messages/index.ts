// src/messages/index.ts

export const MESSAGES = {
  CATEGORY: {
    NOT_FOUND: "Category not found.",
    INVALID_ID: "Invalid category ID.",
    ERROR_LIST: "Error listing categories.",
    USER_NOT_FOUND: "User not found.",
  },
  TOKEN: {
    CREATED_SUCCESS: "Token created successfully!",
    CREATION_FAILED: "Error creating token.",
    LIST_FAILED: "Error listing tokens.",
    NOT_FOUND: "Token not found.",
    INVALID_ID: "Invalid token ID.",
    ALREADY_EXISTS: "Token already exists in your account.",
  },
  TOKEN_BALANCE: {
    NOT_FOUND: "Token balance not found.",
    INSUFFICIENT_FUNDS_TO_SELL:
      "Insufficient balance to perform the Sell operation.",
  },
  USER: {
    ALREADY_REGISTERED: "User already registered.",
    REFRESH_TOKEN_REQUIRED: "Refresh token is required.",
    NOT_FOUND: "User not found.",
    INVALID_CREDENTIALS: "Invalid credentials.",
    TOKEN_INVALID: "Invalid token.",
    INVALID_EMAIL: "Invalid email.",
    INVALID_NAME: "Invalid name.",
    INVALID_PASSWORD: "Invalid password.",
  },
  VALIDATION: {
    REQUIRED_FIELD: (field: string) => `The field ${field} is required.`,
    REQUIRED_DATE_FIELD: (field: string) =>
      `The field ${field} is required and must be a valid date.`,
    REQUIRED_DECIMAL_FIELD: (field: string) =>
      `The field ${field} is required and must be a valid decimal number.`,
    REQUIRED_UUID_FIELD: (field: string) =>
      `The field ${field} is required and must be a valid UUID.`,
  },
  SYSTEM: {
    ERROR: "System error.",
    NOT_FOUND: "Resource not found.",
  },
  IMPORT: {
    INVALID_FILE_TYPE:
      "Invalid file type. Only Excel and CSV files are allowed.",
    FILE_TOO_LARGE: "File is too large. Maximum allowed size is 5MB.",
    PROCESSING_ERROR: "Error processing file.",
    FILE_NOT_FOUND: "File not found.",
    INVALID_FILE_NAME: "Invalid file name.",
    FILE_NOT_VALIDATED: "File not validated.",
    EMPTY_CSV: "CSV file is empty.",
    CATEGORY_SUCCESS: "Categories imported successfully.",
    TOKEN_SUCCESS: "Tokens imported successfully.",
    TOKEN_BALANCE_SUCCESS: "Token balances imported successfully.",
  },
};
