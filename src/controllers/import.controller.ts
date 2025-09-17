import { Request, Response } from "express";
import {
  importCategoriesService,
  importTokensService,
  importTokenBalancesService,
} from "../services/import.service";
import { UploadedFile } from "express-fileupload";
import { MESSAGES } from "../messages";

export const importCategories = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // O arquivo já foi validado pelo middleware
    const file = req.validatedFile!;
    
    const result = await importCategoriesService(file, req.user.id);
    
    return res.status(200).json({ 
      result,
      file: {
        name: file.name,
        size: file.size,
        type: file.mimetype
      }
    });
  } catch (error) {
    throw error;
  }
};

export const importTokens = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const file = req.validatedFile!;
    const result = await importTokensService(file, req.user.id);
    return res.status(200).json({ 
      result,
      file: {
        name: file.name,
        size: file.size,
        type: file.mimetype
      }
    });
  } catch (error) {
    throw error;
  }
};

export const importTokenBalances = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const file = req.validatedFile!;
    const result = await importTokenBalancesService(file, req.user.id);
    return res.status(200).json({ 
      result,
      file: {
        name: file.name,
        size: file.size,
        type: file.mimetype
      }
    });
  } catch (error) {
    throw error;
  }
};