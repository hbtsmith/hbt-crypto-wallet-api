import { parse } from "csv-parse/sync";
import { prisma } from "../config/prisma";
import { UploadedFile } from "express-fileupload";
import { MESSAGES } from "../messages";
import { BadRequestError } from "../helpers/api-errors";
import { operationTypeEnum } from "../helpers/api-consts-enum";
import { getTotalAmountBalanceService } from "./tokenBalance.service";
import { $Enums } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

function parseCsvFile(file: UploadedFile) {
  const content = file.data.toString("utf-8");
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ",",
    trim: true,
  });
}

export async function importCategoriesService(
  file: UploadedFile,
  userId: string
) {
  const records = parseCsvFile(file) as { name: string; description?: string }[];
  
  const importedCategories = [];
  
  for (const record of records) {
    if (!record.name || record.name.trim() === '') {
      throw new BadRequestError(MESSAGES.VALIDATION.REQUIRED_FIELD("name"));
    }

    if (!record.description || record.description.trim() === '') {
      throw new BadRequestError(MESSAGES.VALIDATION.REQUIRED_FIELD("description"));
    }
    
    // Verifica se já existe uma categoria com o mesmo nome para o usuário
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: record.name.trim(),
        userId: userId
      }
    });

    let category;
    if (existingCategory) {
      // Atualiza a categoria existente
      category = await prisma.category.update({
        where: { id: existingCategory.id },
        data: {
          description: record.description || null,
        },
      });
    } else {
      // Cria nova categoria
      category = await prisma.category.create({
        data: {
          name: record.name.trim(),
          description: record.description || null,
          userId,
        },
      });
    }
    
    importedCategories.push(category);
  }

  return { 
    message: MESSAGES.IMPORT.CATEGORY_SUCCESS,
    imported: importedCategories.length,
    categories: importedCategories
  };
}

export async function importTokensService(file: UploadedFile, userId: string) {
  const records = parseCsvFile(file) as {
    name: string;
    symbol: string;
    categoryId: string;
  }[];
  
  const importedTokens = [];
  
  for (const record of records) {
    
    if (!record.name || record.name.trim() === '') {
      throw new BadRequestError(MESSAGES.VALIDATION.REQUIRED_FIELD("name"));
    }
    
    if (!record.symbol || record.symbol.trim() === '') {
      throw new BadRequestError(MESSAGES.VALIDATION.REQUIRED_FIELD("symbol"));
    }
    
    if (!record.categoryId || record.categoryId.trim() === '') {
      throw new BadRequestError(MESSAGES.VALIDATION.REQUIRED_FIELD("categoryId"));
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        id: record.categoryId,
        userId
      }
    });

    if (!existingCategory) {
      throw new BadRequestError(MESSAGES.CATEGORY.NOT_FOUND);
    }

    const existingToken = await prisma.token.findFirst({
      where: {
        symbol: record.symbol,
        categoryId: record.categoryId,
        userId
      }
    });

    let token;
    if (existingToken) {
      token = await prisma.token.update({
        where: { id: existingToken.id },
        data: {
          name: record.name,
          symbol: record.symbol,
          categoryId: record.categoryId,
        },
      });
    } else {
      token = await prisma.token.create({
        data: {
          name: record.name,
          symbol: record.symbol,
          categoryId: record.categoryId,
          userId,
        },
      });
    }

    importedTokens.push(token);
    
  }

  return { 
    message: MESSAGES.IMPORT.TOKEN_SUCCESS,
    imported: importedTokens.length,
    tokens: importedTokens
  };
  
}

export async function importTokenBalancesService(file: UploadedFile, userId: string) {
  const records = parseCsvFile(file) as {
    tokenId: string;
    price: number;
    amount: number;
    operationType: string;
    operationAt: string;
    notes: string;
  }[];

  const importedTokenBalances: { id: string; tokenId: string; amount: Decimal; price: Decimal; operationAt: Date; notes: string | null; operationType: $Enums.OperationType; }[] = [];

  await prisma.$transaction(async (tx) => {

    for (const record of records) {
      
      if (!record.tokenId || record.tokenId.trim() === '') {
        throw new BadRequestError(MESSAGES.VALIDATION.REQUIRED_FIELD("tokenId"));
      }
      
      if (!record.price || record.price < 0) {
        throw new BadRequestError(MESSAGES.VALIDATION.REQUIRED_FIELD("price"));
      }
      
      if (!record.amount || record.amount < 0) {
        throw new BadRequestError(MESSAGES.VALIDATION.REQUIRED_FIELD("amount"));
      }
      
      if (!record.operationAt || record.operationAt.trim() === '') {
        throw new BadRequestError(MESSAGES.VALIDATION.REQUIRED_FIELD("operationAt"));
      }
  
      if (!record.operationType ||
      typeof record.operationType !== "string" ||
      record.operationType.trim() === "" ||
      (record.operationType !== operationTypeEnum.SELL &&
        record.operationType !== operationTypeEnum.BUY)
      ){
        throw new BadRequestError(MESSAGES.VALIDATION.REQUIRED_FIELD("operationType"));
      }
  
      const existingToken = await tx.token.findFirst({
        where: {
          id: record.tokenId,
          userId
        }
      });
  
      if (!existingToken) {
        throw new BadRequestError(MESSAGES.TOKEN.NOT_FOUND);
      }
  
      const totalAmount = await getTotalAmountBalanceService(userId, record.tokenId);
  
      if (record.operationType === operationTypeEnum.SELL) {
        if (totalAmount && totalAmount.lessThan(record.amount)) {
          throw new BadRequestError(MESSAGES.TOKEN_BALANCE.INSUFFICIENT_FUNDS_TO_SELL);
        }
      }

      importedTokenBalances.push(
        await tx.tokenBalance.create({
          data: {
            tokenId: record.tokenId,
            price: record.price,
            amount: record.amount,
            operationType: record.operationType,
            operationAt: record.operationAt,
            notes: record.notes ?? null
          }
        })
      );

    }
  });

  return {
    message: MESSAGES.IMPORT.TOKEN_BALANCE_SUCCESS,
    imported: importedTokenBalances.length,
    tokenBalances: importedTokenBalances
  };

}
