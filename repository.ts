import { Request } from "express";
import { Analysis } from "./generated/prisma";
import { LoadResultsResponse, Status, Summary } from "./types/analyzerTypes";
import { PrismaClient } from "./generated/prisma";
import { JsonValue } from "./generated/prisma/runtime/library";
import { ParsedQs } from "qs";

const prismaClient = new PrismaClient()


export async function saveFile(fileName: string, userId: string, summary: Summary): Promise<Analysis> {
    return await prismaClient.analysis.create({
        data: {
            filename: fileName,
            userId: userId,
            result: JSON.parse(JSON.stringify(summary))
        }
    })
}

export async function loadAnalysisOf(id: string): Promise<Analysis | null> {
    return await prismaClient.analysis.findUnique({ where: { id } });
}

export async function loadResults(query: ParsedQs): Promise<LoadResultsResponse> {
    const { userId, since } = query
    const where: Record<string, any> = {}
    const { SUCCESS, FAIL } = Status

    if (userId) {
        where["userId"] = userId
    }
    if (since) {
        const sinceDate = new Date(since as string)
        if (!isNaN(sinceDate.getTime())) {
            where["createdAt"] = { gt: sinceDate }
        } else {
            return { results: [], status: FAIL, message: "Invalid format of since" }
        }
    }

    const results = await prismaClient.analysis.findMany({
        where: where
    })

    return { results: results.map((analysis: Analysis) => analysis.result), status: SUCCESS, message: "" }
}