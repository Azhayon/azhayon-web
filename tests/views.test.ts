import { describe, expect, it } from "vitest";
import { buildViewUrl, viewKey } from "@/lib/views";

describe("buildViewUrl", () => {
  it("builds the counter address under the API", () => {
    expect(buildViewUrl("http://127.0.0.1:8000/api/v1", "a-post")).toBe("http://127.0.0.1:8000/api/v1/posts/a-post/view");
  });

  it("ignores trailing slashes and spaces", () => {
    expect(buildViewUrl(" https://api.example.com/api/v1/ ", "x1")).toBe("https://api.example.com/api/v1/posts/x1/view");
  });

  it("returns null without an API address", () => {
    expect(buildViewUrl("", "a-post")).toBeNull();
    expect(buildViewUrl("   ", "a-post")).toBeNull();
  });

  it("returns null for slugs that could not exist", () => {
    for (const slug of ["", "A-Post", "a/b", "a b", "../x", "a?b=1"]) {
      expect(buildViewUrl("http://127.0.0.1:8000/api/v1", slug)).toBeNull();
    }
  });
});

describe("viewKey", () => {
  it("is specific to the post", () => {
    expect(viewKey("a-post")).toBe("azm_viewed:a-post");
    expect(viewKey("a-post")).not.toBe(viewKey("b-post"));
  });
});