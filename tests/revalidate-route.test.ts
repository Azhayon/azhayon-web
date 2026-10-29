import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as route from "../src/app/api/revalidate/route";
import { ALL_TAGS } from "../src/lib/cache-tags";
import { MAX_BODY_BYTES } from "../src/lib/revalidation";

const mocks = vi.hoisted(() => ({
  revalidateTag: vi.fn(),
  secret: { value: null as string | null },
}));

vi.mock("next/cache", () => ({ revalidateTag: mocks.revalidateTag }));
vi.mock("@/lib/env", () => ({ serverEnv: () => ({ revalidateSecret: mocks.secret.value }) }));

const secret = "s".repeat(40);

function signed(body: string, options: { timestamp?: number; key?: string } = {}): RequestInit {
  const timestamp = String(options.timestamp ?? Math.floor(Date.now() / 1000));
  const signature = createHmac("sha256", options.key ?? secret).update(`${timestamp}.${body}`).digest("hex");

  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Revalidate-Timestamp": timestamp,
      "X-Revalidate-Signature": `sha256=${signature}`,
    },
    body,
  };
}

const call = (init: RequestInit) => route.POST(new Request("http://localhost/api/revalidate", init));

beforeEach(() => {
  mocks.revalidateTag.mockClear();
  mocks.secret.value = secret;
});

describe("POST /api/revalidate", () => {
  it("only answers POST", () => {
    expect(Object.keys(route)).toEqual(["POST"]);
  });

  it("expires every tag immediately and says which", async () => {
    const response = await call(signed('{"tags":["posts","post:some-slug","posts"]}'));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ revalidated: true, tags: ["posts", "post:some-slug"] });

    expect(mocks.revalidateTag).toHaveBeenCalledTimes(2);
    expect(mocks.revalidateTag).toHaveBeenCalledWith("posts", { expire: 0 });
    expect(mocks.revalidateTag).toHaveBeenCalledWith("post:some-slug", { expire: 0 });
  });

  it("expands 'all' into every site-wide tag", async () => {
    const response = await call(signed('{"tags":["all"]}'));

    expect(response.status).toBe(200);
    expect(mocks.revalidateTag).toHaveBeenCalledTimes(ALL_TAGS.length);

    for (const tag of ALL_TAGS) {
      expect(mocks.revalidateTag).toHaveBeenCalledWith(tag, { expire: 0 });
    }
  });

  it("refuses requests that are not properly signed", async () => {
    const body = '{"tags":["posts"]}';
    const old = Math.floor(Date.now() / 1000) - 3600;

    const attempts: RequestInit[] = [
      { method: "POST", body },
      signed(body, { key: "x".repeat(40) }),
      signed(body, { timestamp: old }),
      { ...signed('{"tags":["home"]}'), body }, // signed for one body, sent with another
    ];

    for (const attempt of attempts) {
      const response = await call(attempt);

      expect(response.status).toBe(401);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(await response.json()).toEqual({ error: "unauthorized" });
    }

    expect(mocks.revalidateTag).not.toHaveBeenCalled();
  });

  it("refuses a correctly signed request with a bad tag list", async () => {
    for (const body of ['{"tags":["Bad Tag"]}', "{}", '{"tags":[]}', "not json"]) {
      expect((await call(signed(body))).status, body).toBe(422);
    }

    expect(mocks.revalidateTag).not.toHaveBeenCalled();
  });

  it("refuses a body that is too large", async () => {
    const response = await call(signed("x".repeat(MAX_BODY_BYTES + 1)));

    expect(response.status).toBe(413);
    expect(mocks.revalidateTag).not.toHaveBeenCalled();
  });

  it("does nothing when no secret is configured", async () => {
    mocks.secret.value = null;

    const response = await call(signed('{"tags":["posts"]}'));

    expect(response.status).toBe(503);
    expect(mocks.revalidateTag).not.toHaveBeenCalled();
  });
});