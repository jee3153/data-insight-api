import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { execSync } from 'child_process'
import { PrismaClient } from "../generated/prisma";
import { Client } from 'pg'

type TestContainerSetup = {
    container: StartedPostgreSqlContainer,
    client: PrismaClient
}

export async function startPostgresContainer(): Promise<TestContainerSetup> {
    console.log("Starting PostgreSQL container...")
    const hostname = process.env.DB_HOST || "postgres"
    const password = process.env.DB_PASSWORD || "password"
    const database = "public"
    const container = await new PostgreSqlContainer("postgres:13.3-alpine")
        .withHostname(hostname)
        .withPassword(password)
        .withDatabase(database)
        .start()
    const connectionUrl = container.getConnectionUri()
    // const client = new Client({ connectionString: container.getConnectionUri() })
    // await client.connect()
    // await createAnalysisTable(client)
    console.log(`container connectionURl: ${connectionUrl}`)
    process.env.DATABASE_URL = connectionUrl
    process.env.PORT = "6530"

    execSync("npx prisma migrate deploy --schema=../prisma/schema.prisma", {
        env: {
            ...process.env,
            DATABASE_URL: connectionUrl,
        },
        cwd: __dirname
    })

    const client = new PrismaClient({
        datasources: {
            db: {
                url: connectionUrl
            }
        }
    })
    console.log("database setup complete")

    return { container, client }
}

export async function createAnalysisTable(client: Client) {
    const CREATE_TABLE = "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";CREATE TABLE \"Analysis\" (id text primary key default uuid_generate_v4(), filename text, result JSON, user_id text, createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)"
    await client.query(CREATE_TABLE)
    console.log("table 'Analysis' created.")
}

export async function cleanupDatabase(client: PrismaClient) {
    await client.analysis.deleteMany({})
}

export async function closeAllConnection(testContainerSetup: TestContainerSetup) {
    const { container, client } = testContainerSetup
    await client.$disconnect()
    await container.stop()
}