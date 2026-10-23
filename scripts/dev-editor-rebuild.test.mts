// Checks the in-page editor's rebuild against real posts: run with `node scripts/dev-editor-rebuild.test.mts`.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";

import { rebuildBody, wrap, type Piece, type SourceBlock } from "../src/shared/blog/dev-editor/rebuild.ts";

const SKIP = new Set(["definition", "html", "footnoteDefinition", "yaml"]);
const dir = "src/content/blog/posts";

function blocksOf(body: string): SourceBlock[] {
    const tree = unified().use(remarkParse).use(remarkGfm).parse(body);
    return tree.children
        .filter((n) => !SKIP.has(n.type))
        .map((n) => ({ type: n.type, depth: (n as { depth?: number }).depth, start: n.position!.start.offset!, end: n.position!.end.offset! }));
}

const untouched = (blocks: SourceBlock[]): Piece[] => blocks.map((_, i) => ({ original: i, markdown: "" }));

for (const file of fs.readdirSync(dir)) {
    const body = matter(fs.readFileSync(path.join(dir, file), "utf8")).content;
    const blocks = blocksOf(body);

    // No edits: the file comes back byte for byte.
    assert.equal(rebuildBody(body, blocks, untouched(blocks)), body, `${file}: unchanged round trip`);

    // One paragraph rewritten: only that block changes.
    const p = blocks.findIndex((b) => b.type === "paragraph");
    const pieces = untouched(blocks);
    pieces[p] = { original: null, markdown: "A rewritten paragraph." };
    const out = rebuildBody(body, blocks, pieces);
    assert.equal(out, body.slice(0, blocks[p].start) + "A rewritten paragraph." + body.slice(blocks[p].end), `${file}: one edit`);

    // A block deleted and a new paragraph added after the first block.
    const edited = untouched(blocks).filter((_, i) => i !== 3);
    edited.splice(1, 0, { original: null, markdown: "New paragraph." });
    const out2 = rebuildBody(body, blocks, edited);
    assert.ok(out2.includes("\n\nNew paragraph.\n\n"), `${file}: insert`);
    assert.ok(!out2.includes(body.slice(blocks[3].start, blocks[3].end)) || blocks[3].end - blocks[3].start < 20, `${file}: delete`);
    console.log(`ok ${file} (${blocks.length} blocks)`);
}

// Wrapping breaks at spaces only, so a long URL stays on one line.
const long = "See " + "word ".repeat(30) + "https://example.com/" + "x".repeat(140) + " end.";
for (const line of wrap(long).split("\n")) assert.ok(line.length <= 115 || line.startsWith("https://"), "wrap width");
assert.ok(wrap(long).includes("https://example.com/" + "x".repeat(140)), "url kept whole");
console.log("ok wrap");
