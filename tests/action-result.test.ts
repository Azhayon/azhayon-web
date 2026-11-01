import { describe, expect, it } from "vitest";
import { describeFailure, failureFromError } from "@/lib/action-result";

describe("describeFailure", () => {
  it("maps each status to a fixed code", () => {
    expect(describeFailure(401).code).toBe("signin");
    expect(describeFailure(403).code).toBe("banned");
    expect(describeFailure(404).code).toBe("missing");
    expect(describeFailure(429).code).toBe("limit");
    expect(describeFailure(500).code).toBe("unavailable");
    expect(describeFailure(503).code).toBe("unavailable");
    expect(describeFailure(418).code).toBe("unavailable");
  });

  it("always has a message of our own", () => {
    for (const status of [401, 403, 404, 422, 429, 500]) {
      expect(describeFailure(status).message.length).toBeGreaterThan(10);
    }
  });

  it("explains validation problems per known field without repeating API text", () => {
    const failure = describeFailure(422, { body: ["The body field is required."], score: ["x"] });

    expect(failure.code).toBe("invalid");
    expect(Object.keys(failure.fields ?? {}).sort()).toEqual(["body", "score"]);
    expect(JSON.stringify(failure)).not.toContain("The body field");
  });

  it("ignores unknown or dangerous field names", () => {
    const failure = describeFailure(422, { foo: ["x"], ["__proto__"]: ["y"] });

    expect(failure.code).toBe("invalid");
    expect(failure.fields).toEqual({});
  });
});

describe("failureFromError", () => {
  it("describes errors that carry a status", () => {
    expect(failureFromError({ status: 429 }).code).toBe("limit");
    expect(failureFromError({ status: 422, errors: { parent_id: ["x"] } }).fields).toHaveProperty("parent_id");
  });

  it("treats anything else as unavailable", () => {
    expect(failureFromError(new Error("boom")).code).toBe("unavailable");
    expect(failureFromError(null).code).toBe("unavailable");
    expect(failureFromError("text").code).toBe("unavailable");
  });
});