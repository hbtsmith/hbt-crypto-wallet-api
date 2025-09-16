import { Request, Response, NextFunction } from "express";
import { UploadedFile } from "express-fileupload";
import { MESSAGES } from "../messages";
import { BadRequestError, ForbiddenError, InternalServerError, NotFoundError } from "../helpers/api-errors";

/**
 * Middleware para validação de arquivos de upload
 * Segue o princípio Single Responsibility - apenas valida arquivos
 */
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verifica se há arquivos
    if (!req.files || !req.files.file) {
      throw new NotFoundError(MESSAGES.IMPORT.FILE_NOT_FOUND);
    }

    const file = req.files.file as UploadedFile;

    // Validação de tipo de arquivo
    const allowedMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ForbiddenError(MESSAGES.IMPORT.INVALID_FILE_TYPE);
    }

    // Validação de tamanho (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB em bytes
    if (file.size > maxSize) {
      throw new ForbiddenError(MESSAGES.IMPORT.FILE_TOO_LARGE);
    }

    // Validação de nome do arquivo
    if (!file.name || file.name.trim() === '') {
      throw new ForbiddenError(MESSAGES.IMPORT.INVALID_FILE_NAME);
    }

    // Se chegou até aqui, o arquivo é válido
    // Adiciona o arquivo validado ao request para uso posterior
    req.validatedFile = file;
    next();

  } catch (error) {
    // Passa o erro para o middleware de tratamento de erros
    next(error);
  }
};

/**
 * Middleware específico para validação de arquivos CSV
 * Pode ser usado quando precisar de validações mais específicas
 */
export const validateCsvFile = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.validatedFile) {
      throw new BadRequestError(MESSAGES.IMPORT.FILE_NOT_VALIDATED);
    }

    const file = req.validatedFile;

    // Validação específica para CSV
    if (file.mimetype !== 'text/csv') {
      throw new ForbiddenError(MESSAGES.IMPORT.INVALID_FILE_TYPE);
    }

    // Verifica se o arquivo tem conteúdo
    if (!file.data || file.data.length === 0) {
      throw new BadRequestError(MESSAGES.IMPORT.EMPTY_CSV);
    }

    next();

  } catch (error) {
    // Passa o erro para o middleware de tratamento de erros
    next(error);
  }
};
