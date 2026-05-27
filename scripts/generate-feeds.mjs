// Generates public/rss.xml and public/sitemap.xml from the Markdown posts.
// Run as a postbuild step (see package.json). Kept dependency-light: just reads
// frontmatter with gray-matter, the same posts the site renders.

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

// Keep in sync with SITE_URL in src/lib/format.ts.
const SITE_URL = "https://petermckee.dev";

const root = process.cwd();
const postsDir = path.join(root, "src/content/blog/posts");
const publicDir = path.join(root, "public");
const common = JSON.parse(fs.readFileSync(path.join(root, "src/content/common/common.json"), "utf8"));
const authors = JSON.parse(fs.readFileSync(path.join(root, "src/content/blog/authors.json"), "utf8"));

const escapeXml = (value) =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

const toIsoDate = (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? ""));

const readPosts = () => {
    if (!fs.existsSync(postsDir)) return [];

    return fs
        .readdirSync(postsDir)
        .filter((file) => file.endsWith(".md"))
        .map((file) => {
            const slug = file.replace(/\.md$/, "");
            const { data } = matter(fs.readFileSync(path.join(postsDir, file), "utf8"));
            return {
                slug: data.slug || slug,
                title: data.title || slug,
                date: toIsoDate(data.date),
                excerpt: data.excerpt || "",
                tags: data.tags || [],
                draft: Boolean(data.draft),
            };
        })
        .filter((post) => !post.draft) // feeds are public — never include drafts
        .sort((a, b) => b.date.localeCompare(a.date));
};

const buildRss = (posts) => {
    const items = posts
        .map(
            (post) => `        <item>
            <title>${escapeXml(post.title)}</title>
            <link>${SITE_URL}/blog/${post.slug}</link>
            <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
            <pubDate>${new Date(post.date).toUTCString()}</pubDate>
            <description>${escapeXml(post.excerpt)}</description>
        </item>`,
        )
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>${escapeXml(common.name)} — Blog</title>
        <link>${SITE_URL}/blog</link>
        <description>Notes on building software — databases, systems, and AI.</description>
        <language>en-us</language>
        <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
    </channel>
</rss>
`;
};

const buildSitemap = (posts) => {
    const tags = [...new Set(posts.flatMap((post) => post.tags))];
    const urls = [
        "/",
        "/resume",
        "/blog",
        ...posts.map((post) => `/blog/${post.slug}`),
        ...tags.map((tag) => `/blog/tag/${encodeURIComponent(tag)}`),
        ...authors.map((author) => `/blog/author/${author.id}`),
    ];

    const entries = urls.map((url) => `    <url><loc>${SITE_URL}${url}</loc></url>`).join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
};

const posts = readPosts();
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, "rss.xml"), buildRss(posts));
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), buildSitemap(posts));

console.log(`Generated rss.xml and sitemap.xml (${posts.length} published posts).`);
