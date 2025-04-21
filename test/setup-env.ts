import dotenv from "dotenv"
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), ".env.test") })

if (!process.env.TESTCONTAINERS_RYUK_DISABLED) {
    console.warn("⚠️ .env.test not loaded properly — TESTCONTAINERS_RYUK_DISABLED is missing!")
}
