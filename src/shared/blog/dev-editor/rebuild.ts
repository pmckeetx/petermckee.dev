// Pure helpers for the in-page editor: turn the edited page back into the post's Markdown, keeping every
// block you didn't touch exactly as it was in the source.

export interface SourceBlock {
    type: string;
    depth?: number;
    start: number;
    end: number;
}

// One top-level block of the edited page: either an untouched source block (by index) or new Markdown.
export interface Piece {
    original: number | null;
    markdown: string;
}

export function rebuildBody(body: string, blocks: SourceBlock[], pieces: Piece[]): string {
    const head = blocks.length ? body.slice(0, blocks[0].start) : "\n";
    const tail = blocks.length ? body.slice(blocks[blocks.length - 1].end) : "\n";
    let out = "";
    let prev: number | null = null;
    for (const piece of pieces) {
        const text = piece.original !== null ? body.slice(blocks[piece.original].start, blocks[piece.original].end) : piece.markdown;
        if (!text.trim()) continue;
        if (out) {
            // Two neighbouring source blocks keep the exact gap between them; anything else gets a blank line.
            const neighbours = prev !== null && piece.original === prev + 1;
            out += neighbours ? body.slice(blocks[prev!].end, blocks[piece.original!].start) : "\n\n";
        }
        out += text;
        prev = piece.original;
    }
    return head + out + tail;
}

// Re-wrap a paragraph at the width the posts are written at. Breaks only at spaces, so URLs stay whole.
export function wrap(text: string, width = 115): string {
    return text
        .split("\n")
        .map((line) => {
            const words = line.split(" ");
            const lines: string[] = [];
            let current = "";
            for (const word of words) {
                if (current && current.length + 1 + word.length > width) {
                    lines.push(current);
                    current = word;
                } else {
                    current = current ? `${current} ${word}` : word;
                }
            }
            lines.push(current);
            return lines.join("\n");
        })
        .join("\n");
}

// Does a rendered top-level element look like the source block it should be paired with?
export function fits(el: Element, block: SourceBlock): boolean {
    switch (block.type) {
        case "heading":
            return el.tagName === `H${block.depth}`;
        case "paragraph":
            return el.tagName === "P";
        case "list":
            return el.tagName === "UL" || el.tagName === "OL";
        case "blockquote":
            return el.tagName === "BLOCKQUOTE";
        case "thematicBreak":
            return el.tagName === "HR";
        case "code":
            return el.querySelector("pre") !== null;
        case "table":
            return el.tagName === "TABLE" || el.querySelector("table") !== null;
        default:
            return true;
    }
}
