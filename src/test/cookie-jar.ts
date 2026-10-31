// Stand-in for `next/headers`, which only works inside a real Next request.
// Kept free of imports so `vi.mock("next/headers", ...)` can load it without
// a cycle (helpers.ts imports the auth modules that import next/headers).
export const cookieJar = new Map<string, string>();

export async function cookies() {
  return {
    get: (name: string) =>
      cookieJar.has(name) ? { name, value: cookieJar.get(name)! } : undefined,
  };
}
