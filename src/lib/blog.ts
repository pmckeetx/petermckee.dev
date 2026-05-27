// Server-only blog data layer. Reads Markdown posts from disk at build time
// (used inside getStaticProps/getStaticPaths). Never import this from a client
// component — it pulls in `fs`. Import types from "lib/blog-types" instead.

import fs from "fs";
import path from "path";

import matter from "gray-matter";
import readingTime from "reading-time";

import authorsData from "content/blog/authors.json";
import type { Author, Post, PostMeta } from "lib/blog-types";

const POSTS_DIR = path.join(process.cwd(), "src/content/blog/posts");
const isProd = process.env.NODE_ENV === "production";

const authors = authorsData as Author[];

const toIsoDate = (value: unknown): string => {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return String(value ?? "");
};

const getPostSlugs = (): string[] => {
    if (!fs.existsSync(POSTS_DIR)) return [];
    return fs
        .readdirSync(POSTS_DIR)
        .filter((file) => file.endsWith(".md"))
        .map((file) => file.replace(/\.md$/, ""));
};

const readPost = (slug: string): Post | null => {
    const fullPath = path.join(POSTS_DIR, `${slug}.md`);
    if (!fs.existsSync(fullPath)) return null;

    const raw = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(raw);

    const meta: PostMeta = {
        slug: (data.slug as string) || slug,
        title: (data.title as string) || slug,
        date: toIsoDate(data.date),
        tags: (data.tags as string[]) || [],
        author: (data.author as string) || (authors[0]?.id ?? "peter"),
        excerpt: (data.excerpt as string) || "",
        // null (not undefined) so Next.js can JSON-serialize the props.
        hero: (data.hero as string) || null,
        heroAlt: (data.heroAlt as string) || null,
        featured: Boolean(data.featured),
        draft: Boolean(data.draft),
        readingTime: readingTime(content).text,
    };

    return { meta, body: content };
};

/** All posts with bodies, newest first. Drafts are excluded in production. */
export const getAllPosts = (): Post[] =>
    getPostSlugs()
        .map(readPost)
        .filter((post): post is Post => post !== null)
        .filter((post) => !isProd || !post.meta.draft)
        .sort((a, b) => b.meta.date.localeCompare(a.meta.date));

/** Lightweight metadata list (no bodies) for listing/filtering pages. */
export const getAllPostsMeta = (): PostMeta[] => getAllPosts().map((post) => post.meta);

export const getPostBySlug = (slug: string): Post | null => {
    const post = readPost(slug);
    if (!post) return null;
    if (isProd && post.meta.draft) return null;
    return post;
};

export const getAllSlugs = (): string[] => getAllPosts().map((post) => post.meta.slug);

export const getAllTags = (): string[] => {
    const tags = new Set<string>();
    getAllPostsMeta().forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
};

export const getPostsByTag = (tag: string): PostMeta[] =>
    getAllPostsMeta().filter((post) => post.tags.some((t) => t.toLowerCase() === tag.toLowerCase()));

export const getAuthors = (): Author[] => authors;

export const getAuthor = (id: string): Author | null => authors.find((a) => a.id === id) ?? null;

export const getPostsByAuthor = (id: string): PostMeta[] =>
    getAllPostsMeta().filter((post) => post.author === id);

/** Posts sharing the most tags with the given post, newest first, capped. */
export const getRelated = (slug: string, limit = 3): PostMeta[] => {
    const all = getAllPostsMeta();
    const current = all.find((post) => post.slug === slug);
    if (!current) return [];

    return all
        .filter((post) => post.slug !== slug)
        .map((post) => ({
            post,
            shared: post.tags.filter((tag) => current.tags.includes(tag)).length,
        }))
        .filter((entry) => entry.shared > 0)
        .sort((a, b) => b.shared - a.shared || b.post.date.localeCompare(a.post.date))
        .slice(0, limit)
        .map((entry) => entry.post);
};

/** Date-adjacent posts. `newer` is the next post forward in time, `older` the previous. */
export const getPrevNext = (slug: string): { older: PostMeta | null; newer: PostMeta | null } => {
    const all = getAllPostsMeta(); // newest first
    const index = all.findIndex((post) => post.slug === slug);
    if (index === -1) return { older: null, newer: null };

    return {
        newer: index > 0 ? all[index - 1] : null,
        older: index < all.length - 1 ? all[index + 1] : null,
    };
};
