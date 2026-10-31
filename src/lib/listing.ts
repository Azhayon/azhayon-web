import "server-only";
import { notFound } from "next/navigation";
import { getPosts, type PostsParams } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/http";
import type { PostsResponse } from "@/lib/api-types";
import { PER_PAGE } from "./paging";

const NOTHING: PostsResponse = { data: [], meta: { page: 1, per_page: PER_PAGE, total: 0, last_page: 1 } };

/**
 * One page of posts. A page past the last is a 404. Page 1 with nothing on it is shown as an
 * empty list, not an error, so a new site without posts still builds.
 */
export async function loadPostsPage(filters: Omit<PostsParams, "page" | "per_page">, page: number): Promise<PostsResponse> {
  try {
    return await getPosts({ ...filters, page, per_page: PER_PAGE });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      if (page === 1) {
        return NOTHING;
      }

      notFound();
    }

    throw error;
  }
}