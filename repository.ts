import { Analysis } from "./generated/prisma";
import { Summary } from "./types/analyzerTypes";
import { PrismaClient } from "./generated/prisma";

const prismaClient = new PrismaClient()


export async function saveFile(fileName: string, userId: string, summary: Summary): Promise<Analysis> {
    return await prismaClient.analysis.create({
        data: {
            filename: fileName,
            userId,
            result: JSON.parse(JSON.stringify(summary))
        }
    })
}

export async function loadAnalysisOf(id: string): Promise<Analysis | null> {
    return await prismaClient.analysis.findUnique({ where: { id } })
}