import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    include: ["src/**/*.test.ts"],
    globalSetup: ["src/test/global-setup.ts"],
    env: {
      // API tests use their own database, rebuilt from migrations each run.
      DATABASE_URL: "file:./test.db",
      SESSION_SECRET: "test-secret",
      ADMIN_USERNAME: "admin",
      ADMIN_PASSWORD: "test-password",
    },
    // Test files share test.db, so run them one at a time.
    fileParallelism: false,
  },
});
