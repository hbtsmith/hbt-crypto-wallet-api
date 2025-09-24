/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.spec.ts"],
    setupFiles: ["./tests/setup-env.ts", "./tests/vitest.setup.ts"],
    watch: false,
    coverage: {
      reporter: ["text", "html"],
      exclude: ["tests", "src/docs", "src/config/swagger.ts"],
    },
  },
  esbuild: {
    target: "node18"
  }
});
