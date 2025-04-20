import { Analysis } from "../generated/prisma";
import { LoadResultsResponse, ResultQuery, Status, Summary, AnalysisResult } from "./types/analyzerTypes";
import { PrismaClient } from "../generated/prisma";
import { ParsedQs } from "qs";


export async function saveFile(client: PrismaClient, fileName: string, userId: string, summary: Summary): Promise<Analysis> {
    return await client.analysis.create({
        data: {
            filename: fileName,
            userId: userId,
            result: JSON.parse(JSON.stringify(summary))
        }
    })
}

export async function loadAnalysisOf(client: PrismaClient, id: string): Promise<Analysis | null> {
    return await client.analysis.findUnique({ where: { id } });
}

export async function loadResults(client: PrismaClient, query: ParsedQs): Promise<LoadResultsResponse> {
    const where = buildQueriesForResults(query)
    if (!where) {
        return { results: [], status: Status.FAIL, message: "Invalid format of since" }
    }

    const results = await client.analysis.findMany({
        where: where
    })

    return { results: results.map(({ id, createdAt, filename, result }) => ({ id, createdAt, filename, result })), status: Status.SUCCESS, message: "" }
}

function buildQueriesForResults(query: ParsedQs): ResultQuery | null {
    const where: Record<string, any> = {}
    const { userId, since } = query

    if (userId) {
        where["userId"] = userId
    }
    if (since) {
        const sinceDate = new Date(since as string)
        if (!isNaN(sinceDate.getTime())) {
            where["createdAt"] = { gte: sinceDate }
        } else {
            return null
        }
    }
    return where
}