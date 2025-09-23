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
  TOKEN_ALERT: {
    CREATED_SUCCESS: "Token alert created successfully!",
    CREATION_FAILED: "Error creating token alert.",
    LIST_FAILED: "Error listing token alerts.",
    NOT_FOUND: "Token alert not found.",
    INVALID_ID: "Invalid token alert ID.",
    ALREADY_EXISTS: "Token alert already exists for this symbol and price.",
    UPDATED_SUCCESS: "Token alert updated successfully!",
    UPDATE_FAILED: "Error updating token alert.",
    DELETED_SUCCESS: "Token alert deleted successfully!",
    DELETE_FAILED: "Error deleting token alert.",
    ACTIVATED_SUCCESS: "Token alert activated successfully!",
    DEACTIVATED_SUCCESS: "Token alert deactivated successfully!",
    INVALID_DIRECTION: "Invalid direction. Must be CROSS_UP or CROSS_DOWN.",
    INVALID_PRICE: "Price must be a positive number.",
    ALREADY_ACTIVE: "Token alert is already active.",
    ALREADY_INACTIVE: "Token alert is already inactive.",
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
    REQUIRED_BOOLEAN_FIELD: (field: string) =>
      `The field ${field} must be a boolean value.`,
  },
  SYSTEM: {
    ERROR: "System error.",
    NOT_FOUND: "Resource not found.",
    INTERNAL_SERVER_ERROR: "Internal server error.",
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
