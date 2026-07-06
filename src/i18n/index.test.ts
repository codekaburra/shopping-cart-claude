import { describe, expect, it } from "vitest";
import { formatPrice, normalizeLocale, pick } from "./index";

describe("formatPrice", () => {
  it("renders integer cents as a two-decimal dollar string", () => {
    expect(formatPrice(0)).toBe("$0.00");
    expect(formatPrice(500)).toBe("$5.00");
    expect(formatPrice(1299)).toBe("$12.99");
  });
});

describe("pick", () => {
  it("prefers the matching locale value", () => {
    expect(pick("en", "中文", "English")).toBe("English");
    expect(pick("zh", "中文", "English")).toBe("中文");
  });

  it("falls back to Chinese when English is missing", () => {
    expect(pick("en", "中文", null)).toBe("中文");
    expect(pick("en", "中文", undefined)).toBe("中文");
  });

  it("returns null when the Chinese value is also missing", () => {
    expect(pick("en", null, null)).toBeNull();
    expect(pick("zh", null, "English")).toBeNull();
  });
});

describe("normalizeLocale", () => {
  it("keeps a valid 'en' value", () => {
    expect(normalizeLocale("en")).toBe("en");
  });

  it("defaults everything else to 'zh'", () => {
    expect(normalizeLocale("zh")).toBe("zh");
    expect(normalizeLocale("fr")).toBe("zh");
    expect(normalizeLocale(undefined)).toBe("zh");
    expect(normalizeLocale(null)).toBe("zh");
  });
});
