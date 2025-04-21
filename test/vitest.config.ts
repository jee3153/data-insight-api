import { defineConfig } from 'vitest/config'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

if (!process.env.TESTCONTAINERS_RYUK_DISABLED) {
    throw new Error("Failed to load .env.test!")
}

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        mockReset: true,
        include: [
            "integration/**/*.test.ts",
            "unit/**/*.test.ts"
        ],
        testTimeout: 30000,
        hookTimeout: 30000,
        reporters: ["verbose"],
        silent: false
    },
})