import { Request } from 'express'
import { UploadedFile } from 'express-fileupload'

export interface Summary {
    columns: any
}

export interface UploadRequest extends Request {
    files?: {
        file: UploadedFile | UploadedFile[]
    }
    userId: string
}