import type { Blockquote, Root } from "mdast";

// GitHub-style callouts. A blockquote whose first line is a marker renders as a callout box instead of a quote:
//
//   > [!WARNING]
//   > If POLY_API_KEY is already exported...
//
//   > [!NOTE] Running on Linux?
//   > sounddevice needs the system PortAudio library...
//
// Text after the marker is the title; without it, the type's default title is used. The Markdown still reads
// well on GitHub, which renders the same syntax.

export const CALLOUT_TITLES: Record<string, string> = { note: "Note", tip: "Tip", warning: "Watch out" };

const MARKER = /^\[!(NOTE|TIP|WARNING)\][ \t]*([^\n]*)(\n|$)/i;

interface Parent {
    type: string;
    children?: Parent[];
}

function convert(quote: Blockquote) {
    const first = quote.children[0];
    if (first?.type !== "paragraph") return;
    const text = first.children[0];
    if (text?.type !== "text") return;
    const match = text.value.match(MARKER);
    if (!match) return;

    const type = match[1].toLowerCase();
    const title = match[2].trim() || CALLOUT_TITLES[type];
    text.value = text.value.slice(match[0].length);
    if (!text.value) first.children.shift();
    if (!first.children.length) quote.children.shift();
    quote.data = {
        ...quote.data,
        hProperties: { ...quote.data?.hProperties, "data-callout": type, "data-callout-title": title },
    };
}

function walk(node: Parent) {
    for (const child of node.children ?? []) {
        if (child.type === "blockquote") convert(child as unknown as Blockquote);
        walk(child);
    }
}

export const remarkCallouts = () => (tree: Root) => walk(tree as unknown as Parent);
