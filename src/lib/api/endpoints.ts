import "server-only";
import { TAGS } from "@/lib/cache-tags";
import type {
  CategoriesResponse,
  CategoryResponse,
  HomeResponse,
  PostResponse,
  PostsResponse,
  PreviewResponse,
  RedirectsResponse,
  SearchResponse,
  SeriesListResponse,
  SeriesResponse,
  SiteResponse,
  SitemapPostsResponse,
  SitemapSummaryResponse,
  SitemapTaxonomyResponse,
  TagResponse,
  TagsResponse,
} from "@/lib/api-types";
import { ApiError, request } from "./http";

export type PostsParams = {
  category?: string;
  tag?: string;
  series?: string;
  type?: "news" | "review" | "explainer" | "list";
  sort?: "newest" | "popular" | "rating" | "oldest";
  page?: number;
  per_page?: number;
};

export type TagsParams = { type?: "general" | "genre" | "studio"; sort?: "name" | "popular"; page?: number; per_page?: number };

export type SeriesParams = { sort?: "latest" | "title"; page?: number; per_page?: number };

const SLUG = /^[a-z0-9-]+$/;

/** A slug that could not exist is a 404 without bothering the API. */
function slug(value: string): string {
  if (!SLUG.test(value)) {
    throw new ApiError(404, "Not found.");
  }

  return value;
}

export const getSite = () => request<SiteResponse>("/site", { tags: [TAGS.site], revalidate: 300 });

export const getHome = () => request<HomeResponse>("/home", { tags: [TAGS.home], revalidate: 300 });

export const getPosts = (params: PostsParams = {}) =>
  request<PostsResponse>("/posts", { params, tags: [TAGS.posts] });

export const getPost = (postSlug: string) =>
  request<PostResponse>(`/posts/${slug(postSlug)}`, { tags: [TAGS.posts, TAGS.post(postSlug)] });

export const getCategories = () => request<CategoriesResponse>("/categories", { tags: [TAGS.taxonomy] });

export const getCategory = (categorySlug: string) =>
  request<CategoryResponse>(`/categories/${slug(categorySlug)}`, { tags: [TAGS.taxonomy] });

export const getTags = (params: TagsParams = {}) => request<TagsResponse>("/tags", { params, tags: [TAGS.taxonomy] });

export const getTag = (tagSlug: string) => request<TagResponse>(`/tags/${slug(tagSlug)}`, { tags: [TAGS.taxonomy] });

export const getSeriesList = (params: SeriesParams = {}) =>
  request<SeriesListResponse>("/series", { params, tags: [TAGS.taxonomy] });

export const getSeries = (seriesSlug: string) =>
  request<SeriesResponse>(`/series/${slug(seriesSlug)}`, { tags: [TAGS.taxonomy] });

export const getSitemapSummary = () => request<SitemapSummaryResponse>("/sitemap", { tags: [TAGS.sitemap] });

export const getSitemapPosts = (page: number) =>
  request<SitemapPostsResponse>("/sitemap/posts", { params: { page }, tags: [TAGS.sitemap] });

export const getSitemapTaxonomy = () => request<SitemapTaxonomyResponse>("/sitemap/taxonomy", { tags: [TAGS.sitemap] });

export const getRedirects = () => request<RedirectsResponse>("/redirects", { tags: [TAGS.redirects], revalidate: 120 });

/** Search is never cached, and the visitor's address is forwarded so limits count them. */
export const searchPosts = (q: string, params: { page?: number; per_page?: number } = {}) =>
  request<SearchResponse>("/search", { params: { q, ...params }, noStore: true, forwardVisitor: true });

/** A signed draft preview. Never cached. */
export function getPreview(id: string, expires: string, signature: string) {
  if (!/^\d{1,12}$/.test(id) || !/^\d{1,12}$/.test(expires) || !/^[a-f0-9]{64}$/.test(signature)) {
    throw new ApiError(403, "Invalid signature.");
  }

  return request<PreviewResponse>(`/preview/posts/${id}`, {
    params: { expires, signature },
    noStore: true,
    forwardVisitor: true,
  });
}