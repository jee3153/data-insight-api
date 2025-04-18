import { Request } from 'express'
import { UploadedFile } from 'express-fileupload'
import { JsonValue } from '../generated/prisma/runtime/library'

export interface Summary {
    columns: any
}

export interface UploadRequest extends Request {
    files?: {
        file: UploadedFile | UploadedFile[]
    }
    body: {
        userId: string
    }
}

export interface LoadResultsResponse {
    results: JsonValue[]
    status: Status
    message: string
}

export enum Status {
    SUCCESS,
    FAIL
}