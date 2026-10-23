import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// Dev only: the in-page editor (shared/blog/dev-editor) reads a post's Markdown and saves edits through
// this route. It answers 404 outside `next dev`, so it does nothing on the deployed site.

const POSTS_DIR = path.join(process.cwd(), "src/content/blog/posts");
const SKIP = new Set(["definition", "html", "footnoteDefinition", "yaml"]); // render nothing at the top level

export interface SourceBlock {
    type: string;
    depth?: number;
    start: number;
    end: number;
}

const sha = (text: string) => crypto.createHash("sha256").update(text).digest("hex");

// Same split gray-matter makes, so offsets line up with the body BlogMarkdown renders.
const split = (raw: string) => {
    const m = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
    return m ? { frontmatter: m[0], body: raw.slice(m[0].length) } : { frontmatter: "", body: raw };
};

async function topLevelBlocks(body: string): Promise<SourceBlock[]> {
    const { unified } = await import("unified");
    const remarkParse = (await import("remark-parse")).default;
    const remarkGfm = (await import("remark-gfm")).default;
    const tree = unified().use(remarkParse).use(remarkGfm).parse(body);
    return tree.children
        .filter((n) => !SKIP.has(n.type) && n.position)
        .map((n) => ({
            type: n.type,
            depth: "depth" in n ? (n.depth as number) : undefined,
            start: n.position!.start.offset!,
            end: n.position!.end.offset!,
        }));
}

const setTitle = (frontmatter: string, title: string) =>
    frontmatter.replace(/^title:.*$/m, `title: ${JSON.stringify(title)}`);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (process.env.NODE_ENV !== "development") return res.status(404).end();

    const slug = String(req.query.slug ?? "");
    if (!/^[a-z0-9-]+$/.test(slug)) return res.status(400).json({ error: "Bad slug" });
    const file = path.join(POSTS_DIR, `${slug}.md`);
    if (!fs.existsSync(file)) return res.status(404).json({ error: `No post ${slug}` });
    const raw = fs.readFileSync(file, "utf8");
    const { frontmatter, body } = split(raw);

    if (req.method === "GET") {
        return res.json({ body, hash: sha(raw), blocks: await topLevelBlocks(body) });
    }

    if (req.method === "POST") {
        const { body: newBody, title, hash } = req.body as { body: string; title?: string; hash: string };
        if (hash !== sha(raw)) {
            return res.status(409).json({ error: "The post changed on disk since this page loaded. Reload, then edit again." });
        }
        const updated = (title ? setTitle(frontmatter, title) : frontmatter) + newBody;
        fs.writeFileSync(file, updated);

        // Optional: also write a copy somewhere else, such as a review folder. EDIT_COPY_TO in .env.local,
        // with {slug} standing in for the post's slug.
        const copyTo = process.env.EDIT_COPY_TO?.replace("{slug}", slug);
        if (copyTo) {
            fs.mkdirSync(path.dirname(copyTo), { recursive: true });
            fs.writeFileSync(copyTo, updated);
        }
        return res.json({ ok: true, copiedTo: copyTo ?? null });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).end();
}
