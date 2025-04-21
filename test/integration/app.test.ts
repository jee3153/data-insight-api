import request from 'supertest'
import { createApp } from '../../src/app'
import { Express } from 'express'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { Prisma, PrismaClient } from '../../generated/prisma'
import { cleanupDatabase, closeAllConnection, startPostgresContainer } from '../setupTestDB'
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { randomUUID } from 'crypto'

const csvPath = `${process.cwd()}/integrationTest/fixtures`

describe("Test post requests of an app", () => {
    const app = createApp()
    it("should be successful when posting valid csv", async () => {
        const res = await request(app)
            .post("/upload")
            .field("userId", "user321")
            .attach("file", `${csvPath}/Boston.csv`)
            .expect(200)

        expect(res.body?.preview?.columns[""]).toEqual({ "type": "number", "missing": 0, "unique": 506, "suggest_chart": "histogram" })
    })

    it("should fail when posting invalid csv", async () => {
        const res = await request(app)
            .post("/upload")
            .field("userId", "user321")
            .attach("file", `${csvPath}/invalid.csv`)
            .expect(500)
        expect(res.body.error).toBe("Something went wrong uploading the file.")
    })
})

describe("Test get requests of an app", () => {
    let client: PrismaClient
    let container: StartedPostgreSqlContainer
    let app: Express
    const PORT = process.env.PORT

    beforeAll(async () => {
        const setup = await startPostgresContainer()
        client = setup.client
        container = setup.container
        app = createApp(client)
        app.listen(PORT)
    })

    afterAll(async () => {
        await closeAllConnection({ container, client })
    })

    it("should return analysis when request with id param of analysis id", async () => {
        const id = randomUUID()
        const filename = "test.cvs"
        const userId = "test-user"
        const analysisJson = {
            columns: {
                name: {
                    type: "string",
                    missing: 0,
                    unique: 2,
                    suggest_chart: "bar"
                },
                company: {
                    type: "string",
                    missing: 2,
                    unique: 4,
                    suggest_chart: "pie"
                },
                contact: {
                    type: "number",
                    missing: 3,
                    unique: 4,
                    suggest_chart: "histogram"
                }
            }
        }
        await client.analysis.create({
            data: {
                id,
                filename,
                userId,
                result: JSON.parse(JSON.stringify(analysisJson))
            }
        })

        const res = await request(app)
            .get(`/analysis/${id}`)
            .expect(200)

        expect(res.body.analysis.userId).toBe(userId)
        expect(normalizeJson(res.body.analysis.result)).toEqual(normalizeJson(analysisJson))
        expect(res.body.analysis.filename).toBe(filename)
    })

    it("should response with status 400 when given id not found.", async () => {
        const ID = 10000000
        const res = await request(app)
            .get(`/analysis/${ID}`)
            .expect(400)
        expect(res.body.message).toBe(`id ${ID} doesn't exist.`)
    })

    it("should filter analysis results by userId and since timestamp", async () => {
        const now = new Date()
        await persistData(client, buildRandomAnalysis(2), now)

        const res = await request(app)
            .get(`/results?userId=testuser-1&since=${encodeURIComponent(now.toISOString())}`)
            .expect(200)
        expect(res.body.results.length).toBe(1)
    })

    it("should return all the results in database", async () => {
        await cleanupDatabase(client)
        await persistData(client, buildRandomAnalysis(2))

        const res = await request(app)
            .get("/results")
            .expect(200)
        expect(res.body.results.length).toBe(2)
    })

    it("should be able to return results with single userId filter", async () => {
        await persistData(client, buildRandomAnalysis(1), new Date(), "test-userid-filter")

        const res = await request(app)
            .get(`/results?userId=test-userid-filter`)
            .expect(200)
        expect(res.body.results.length).toBe(1)
    })

    it("should be able to return results with single since filter", async () => {
        const now = new Date()
        await persistData(client, buildRandomAnalysis(1), now)

        const res = await request(app)
            .get(`/results?since=${encodeURIComponent(now.toISOString())}`)
            .expect(200)
        expect(res.body.results.length).toBe(1)
    })
})

function generateRandomInt(max: number): number {
    return Math.floor(Math.random() * max)
}

function normalizeJson(json: any): any {
    if (Array.isArray(json)) {
        return json.map(normalizeJson)
    } else if (json && typeof json === 'object') {
        return Object.keys(json)
            .sort()
            .reduce((acc, key) => {
                acc[key] = normalizeJson(json[key])
                return acc
            }, {} as any)
    }
    return json
}
type AnalysisData = { columns: { [key: string]: { type: string; missing: number; unique: number; suggest_chart: string } } }

function buildRandomAnalysis(numberOfAnalysis: number): Prisma.InputJsonValue[] {
    const analysisList: Prisma.InputJsonValue[] = []
    const numOfColumns = generateRandomInt(5) + 1
    const types = ["number", "string"]
    const charts = ["bar", "pie", "histogram"]

    for (let i = 0; i < numberOfAnalysis; i++) {
        const analysis: AnalysisData = { columns: {} }
        for (let j = 0; j < numOfColumns; j++) {
            const column = `column-${j + 1}`
            analysis.columns[column] = {
                type: types[generateRandomInt(1)],
                missing: generateRandomInt(4),
                unique: generateRandomInt(50),
                suggest_chart: charts[generateRandomInt(2)]
            }
        }
        analysisList.push(analysis)
    }
    return analysisList
}

async function persistData(client: PrismaClient, analysisList: Prisma.InputJsonValue[], currentTime: Date = new Date(), userId?: string) {
    let i = 0
    for (const summary of analysisList) {
        await client.analysis.create({
            data: {
                id: randomUUID(),
                filename: "test.csv",
                userId: userId ? userId : `testuser-${i}`,
                result: summary,
                createdAt: new Date(currentTime.toISOString())
            }
        })
        i++
    }
}

