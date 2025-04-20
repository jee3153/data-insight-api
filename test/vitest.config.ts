import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
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