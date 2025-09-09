// src/messages/index.ts

export const MESSAGES = {
  CATEGORY: {
    NOT_FOUND: "Categoria não encontrada.",
    INVALID_ID: "ID da categoria inválido.",
    ERROR_LIST: "Erro ao listar categorias.",
    USER_NOT_FOUND: "Usuário não encontrado.",
  },
  TOKEN: {
    CREATED_SUCCESS: "Token criado com sucesso!",
    CREATION_FAILED: "Erro ao criar token.",
    LIST_FAILED: "Erro ao listar tokens.",
    NOT_FOUND: "Token não encontrado.",
    INVALID_ID: "ID do token inválido.",
    ALREADY_EXISTS: "Token já existe na sua conta.",
  },
  TOKEN_BALANCE: {
    NOT_FOUND: "Saldo de Token não encontrado.",
    INSUFFICIENT_FUNDS_TO_SELL:
      "Saldo insuficiente para realizar a operação de Venda.",
  },
  USER: {
    ALREADY_REGISTERED: "Usuário já registrado.",
    NOT_FOUND: "Usuário não encontrado.",
    INVALID_CREDENTIALS: "Credenciais inválidas.",
    TOKEN_INVALID: "Token inválido.",
    INVALID_EMAIL: "E-mail inválido.",
    INVALID_NAME: "Nome inválido.",
    INVALID_PASSWORD: "Senha inválida.",
  },
  VALIDATION: {
    REQUIRED_FIELD: (field: string) => `O campo ${field} é obrigatório.`,
    REQUIRED_DATE_FIELD: (field: string) =>
      `O campo ${field} é obrigatório e deve ser uma data válida.`,
    REQUIRED_DECIMAL_FIELD: (field: string) =>
      `O campo ${field} é obrigatório e deve ser um número decimal válido.`,
    REQUIRED_UUID_FIELD: (field: string) =>
      `O campo ${field} é obrigatório e deve ser um UUID válido.`,
  },
  SYSTEM: {
    ERROR: "Erro no sistema.",
    NOT_FOUND: "Recurso não encontrado.",
  },
};
