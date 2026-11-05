import { describe, expect, it } from "vitest";
import { describeFailure, invalidInput } from "../src/lib/action-result";

describe("newsletter field messages", () => {
  it("has a message for a refused email", () => {
    expect(invalidInput(["email"]).fields).toEqual({ email: "Enter a valid email address." });
  });

  it("has a message for a refused token", () => {
    expect(describeFailure(422, { token: ["anything"] }).fields?.token).toBe(
      "This link is invalid or has expired. Please sign up again."
    );
  });

  it("never echoes raw API text", () => {
    const failure = describeFailure(422, { email: ["The email field must be a valid email address."] });

    expect(JSON.stringify(failure)).not.toContain("must be a valid");
  });
});