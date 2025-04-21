import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        mockReset: true,
        setupFiles: ["./test/setup-env.ts"],
        include: [
            "test/integration/**/*.test.ts",
            "test/unit/**/*.test.ts"
        ],
        testTimeout: 30000,
        hookTimeout: 30000,
        reporters: ["verbose"],
        silent: false
    },
})