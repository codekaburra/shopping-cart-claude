// Builds a fresh SQLite database for the API tests from the real migrations,
// so tests run against the same schema production uses — never against dev.db.
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

export const TEST_DB_FILE = "test.db";

export default function setup() {
  rmSync(TEST_DB_FILE, { force: true });
  rmSync(`${TEST_DB_FILE}-journal`, { force: true });
  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: `file:./${TEST_DB_FILE}` },
    stdio: "pipe",
  });
  return () => {
    rmSync(TEST_DB_FILE, { force: true });
    rmSync(`${TEST_DB_FILE}-journal`, { force: true });
  };
}
