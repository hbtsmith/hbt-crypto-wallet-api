import { JwtPayload } from 'jsonwebtoken'
import { FileArray, UploadedFile } from 'express-fileupload'

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload & { id: string }
      files?: FileArray
      validatedFile?: UploadedFile
    }
  }
}

export {}
