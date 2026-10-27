import { describe, expect, it } from "vitest";
import { EnvError, parseServerEnv } from "../src/lib/env-parse";

const key = "k".repeat(32);
const local = { API_URL: "http://127.0.0.1:8000/api/v1" };
const production = {
  APP_ENV: "production",
  API_URL: "https://api.example.com/api/v1",
  SITE_URL: "https://example.com",
  FRONTEND_API_KEY: key,
};

function problemsOf(raw: Record<string, string | undefined>): string[] {
  try {
    parseServerEnv(raw);
  } catch (error) {
    if (error instanceof EnvError) {
      return error.problems;
    }

    throw error;
  }

  return [];
}

const mentions = (problems: string[], text: string) => problems.some((problem) => problem.includes(text));

describe("parseServerEnv", () => {
  it("applies safe local defaults and tidies the API address", () => {
    expect(parseServerEnv({ API_URL: "http://127.0.0.1:8000/api/v1/" })).toEqual({
      appEnv: "local",
      apiUrl: "http://127.0.0.1:8000/api/v1",
      siteUrl: "http://localhost:3000",
      allowIndexing: false,
      frontendApiKey: null,
      revalidateSecret: null,
    });
  });

  it("requires a usable API address", () => {
    expect(mentions(problemsOf({}), "API_URL is required")).toBe(true);
    expect(mentions(problemsOf({ API_URL: "   " }), "API_URL is required")).toBe(true);
    expect(mentions(problemsOf({ API_URL: "not a url" }), "full URL")).toBe(true);
    expect(mentions(problemsOf({ API_URL: "ftp://x.test/api" }), "http:// or https://")).toBe(true);
    expect(mentions(problemsOf({ API_URL: "http://user:pw@x.test/api" }), "username or password")).toBe(true);
  });

  it("accepts only the bare site address", () => {
    expect(parseServerEnv({ ...local, SITE_URL: "https://example.com/" }).siteUrl).toBe("https://example.com");
    expect(mentions(problemsOf({ ...local, SITE_URL: "https://example.com/blog" }), "no path")).toBe(true);
    expect(mentions(problemsOf({ ...local, SITE_URL: "https://example.com?x=1" }), "no path")).toBe(true);
  });

  it("is strict in production and lists every problem at once", () => {
    const problems = problemsOf({ APP_ENV: "production", API_URL: "http://api.example.com/api/v1" });

    expect(mentions(problems, "API_URL must use https")).toBe(true);
    expect(mentions(problems, "SITE_URL is required")).toBe(true);
    expect(mentions(problems, "FRONTEND_API_KEY is required")).toBe(true);
  });

  it("accepts a complete production setup", () => {
    expect(parseServerEnv(production)).toMatchObject({ appEnv: "production", allowIndexing: false, frontendApiKey: key });

    expect(parseServerEnv({ ...production, ALLOW_INDEXING: "TRUE", REVALIDATE_SECRET: key })).toMatchObject({
      allowIndexing: true,
      revalidateSecret: key,
    });
  });

  it("rejects short secrets, even locally", () => {
    expect(mentions(problemsOf({ ...local, FRONTEND_API_KEY: "short" }), "32 characters")).toBe(true);
    expect(mentions(problemsOf({ ...local, REVALIDATE_SECRET: "short" }), "32 characters")).toBe(true);
  });

  it("rejects values it does not understand", () => {
    expect(mentions(problemsOf({ ...local, ALLOW_INDEXING: "yes" }), "ALLOW_INDEXING")).toBe(true);
    expect(mentions(problemsOf({ ...local, APP_ENV: "staging" }), "APP_ENV")).toBe(true);
  });
});