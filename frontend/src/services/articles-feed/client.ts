import { z } from "zod";
import { apiRequest, opaqueIdSchema } from "@/services/api";

export const articleSummarySchema = z.object({
  id: opaqueIdSchema,
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string(),
  publishedAt: z.string(),
  authorName: z.string().min(1),
});
export type ArticleSummary = z.infer<typeof articleSummarySchema>;

export const articleDetailSchema = articleSummarySchema.extend({
  bodyHtml: z.string(),
  bookmarked: z.boolean(),
});
export type ArticleDetail = z.infer<typeof articleDetailSchema>;

export const articleCommentSchema = z.object({
  id: opaqueIdSchema,
  articleId: opaqueIdSchema,
  authorName: z.string().min(1),
  body: z.string().min(1),
  createdAt: z.string(),
});
export type ArticleComment = z.infer<typeof articleCommentSchema>;

export type ArticlesFeedClient = {
  list(): Promise<ArticleSummary[]>;
  getBySlug(slug: string): Promise<ArticleDetail>;
  addComment(articleId: string, body: string): Promise<ArticleComment>;
  listComments(articleId: string): Promise<ArticleComment[]>;
  toggleBookmark(articleId: string): Promise<{ bookmarked: boolean }>;
};

const ARTICLES: ArticleSummary[] = [
  articleSummarySchema.parse({
    id: "art_1",
    slug: "study-tips-2026",
    title: "Study Tips for 2026",
    excerpt: "Practical strategies for effective learning.",
    publishedAt: "2026-09-01T08:00:00.000Z",
    authorName: "Solo Editorial",
  }),
];

export function createHttpArticlesFeedClient(): ArticlesFeedClient {
  return {
    async list() {
      return apiRequest("/public/articles", {
        parse: (d) => z.array(articleSummarySchema).parse(d),
      });
    },
    async getBySlug(slug) {
      return apiRequest(`/public/articles/${encodeURIComponent(slug)}`, {
        parse: (d) => articleDetailSchema.parse(d),
      });
    },
    async addComment(articleId, body) {
      return apiRequest(
        `/public/articles/${encodeURIComponent(articleId)}/comments`,
        {
          method: "POST",
          body: JSON.stringify({ body }),
          parse: (d) => articleCommentSchema.parse(d),
        },
      );
    },
    async listComments(articleId) {
      return apiRequest(
        `/public/articles/${encodeURIComponent(articleId)}/comments`,
        {
          parse: (d) => z.array(articleCommentSchema).parse(d),
        },
      );
    },
    async toggleBookmark(articleId) {
      return apiRequest(
        `/public/articles/${encodeURIComponent(articleId)}/bookmark`,
        {
          method: "POST",
          parse: (d) => z.object({ bookmarked: z.boolean() }).parse(d),
        },
      );
    },
  };
}

export function createMockArticlesFeedClient(): ArticlesFeedClient {
  const bookmarks = new Set<string>();
  const comments = new Map<string, ArticleComment[]>();
  let seq = 1;

  return {
    async list() {
      return [...ARTICLES];
    },
    async getBySlug(slug) {
      const article = ARTICLES.find((a) => a.slug === slug);
      if (!article) throw new Error("not_found");
      return articleDetailSchema.parse({
        ...article,
        bodyHtml: "<p>Effective study habits start with consistency.</p>",
        bookmarked: bookmarks.has(String(article.id)),
      });
    },
    async addComment(articleId, body) {
      const row = articleCommentSchema.parse({
        id: `cmt_${seq++}`,
        articleId,
        authorName: "Demo User",
        body,
        createdAt: new Date().toISOString(),
      });
      const list = comments.get(articleId) ?? [];
      list.push(row);
      comments.set(articleId, list);
      return row;
    },
    async listComments(articleId) {
      return comments.get(articleId) ?? [];
    },
    async toggleBookmark(articleId) {
      if (bookmarks.has(articleId)) {
        bookmarks.delete(articleId);
        return { bookmarked: false };
      }
      bookmarks.add(articleId);
      return { bookmarked: true };
    },
  };
}

let active: ArticlesFeedClient = createMockArticlesFeedClient();
export function setArticlesFeedClient(c: ArticlesFeedClient) {
  active = c;
}
export function getArticlesFeedClient() {
  return active;
}
