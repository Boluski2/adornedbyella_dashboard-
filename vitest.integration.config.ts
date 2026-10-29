
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    setupFiles: ["./tests/integration/setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 20000,
    hookTimeout: 20000,
    fileParallelism: false,
  },
});
