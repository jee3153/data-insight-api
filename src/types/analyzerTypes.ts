import { Request } from 'express'
import { UploadedFile } from 'express-fileupload'
import { JsonValue } from '../../generated/prisma/runtime/library'

export interface ColumnSummary {
    type: string
    unique: number
    missing: number
    suggest_chart: string
}

export interface Summary {
    columns: Record<string, ColumnSummary>
}

export interface UploadRequest extends Request {
    files?: {
        file: UploadedFile | UploadedFile[]
    }
    body: {
        userId: string
    }
}

export interface AnalysisResult {
    id: string
    createdAt: Date
    filename: string
    result: JsonValue
}

export interface LoadResultsResponse {
    results: AnalysisResult[]
    status: Status
    message: string
}


export enum Status {
    SUCCESS,
    FAIL
}

export interface ResultQuery {
    userId?: string,
    createdAt?: Date
}