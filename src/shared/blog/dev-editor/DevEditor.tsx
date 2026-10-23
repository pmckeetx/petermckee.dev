import { FC, useCallback, useEffect, useRef, useState } from "react";

import { Box, Button, HStack, IconButton, Input, Text, Tooltip, useColorModeValue } from "@chakra-ui/react";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

import { fits, Piece, rebuildBody, SourceBlock, wrap } from "shared/blog/dev-editor/rebuild";

// Local-only editor: edit a post in place, like a document, and save it back to its Markdown. BlogPost
// loads it only under `next dev`, and its API route answers 404 everywhere else.
//
// How saving stays faithful: the API parses the post and returns each top-level block's offsets. The page
// renders one top-level element per block, so element i is block i. On save, every element you didn't touch
// is copied from the source as it was; only changed or new elements are turned back into Markdown.

interface Source {
    body: string;
    hash: string;
    blocks: SourceBlock[];
}

const SAVED_KEY = "dev-editor-saved";

const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**",
    bulletListMarker: "-",
});
turndown.use(gfm);
turndown.remove(["button", "script", "style"]);

const container = () => document.getElementById("post-body")?.firstElementChild as HTMLElement | null;
const titleEl = () => document.querySelector<HTMLElement>("[data-edit-title]");

export const DevEditor: FC<{ slug: string }> = ({ slug }) => {
    const [editing, setEditing] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [status, setStatus] = useState("");
    const [linkOpen, setLinkOpen] = useState(false);
    const [link, setLink] = useState("https://");
    const source = useRef<Source | null>(null);
    const originals = useRef<{ html: string; tag: string }[]>([]);
    const originalTitle = useRef("");
    const savedRange = useRef<Range | null>(null);
    const bg = useColorModeValue("white", "gray.800");
    const border = useColorModeValue("blackAlpha.200", "whiteAlpha.300");

    // After a save the page reloads; put the reader back where they were and say what happened.
    useEffect(() => {
        const saved = sessionStorage.getItem(SAVED_KEY);
        if (!saved) return;
        sessionStorage.removeItem(SAVED_KEY);
        const { y, message } = JSON.parse(saved);
        setTimeout(() => window.scrollTo(0, y), 50);
        setStatus(message);
    }, []);

    const markDirty = useCallback(() => setDirty(true), []);

    const pastePlain = useCallback((e: ClipboardEvent) => {
        e.preventDefault();
        document.execCommand("insertText", false, e.clipboardData?.getData("text/plain") ?? "");
    }, []);

    const start = async () => {
        const root = container();
        if (!root) return setStatus("Can't find the post body on this page.");
        const res = await fetch(`/api/dev/post?slug=${slug}`);
        if (!res.ok) return setStatus(`Couldn't load the post: ${res.status}`);
        const src: Source = await res.json();
        const els = Array.from(root.children) as HTMLElement[];
        const mismatch = els.length !== src.blocks.length || els.some((el, i) => !fits(el, src.blocks[i]));
        if (mismatch) {
            return setStatus(`Can't match this page to its Markdown (${els.length} blocks on the page, ${src.blocks.length} in the file). Edit the .md instead.`);
        }
        els.forEach((el, i) => {
            el.dataset.blk = String(i);
            if (src.blocks[i].type === "code") {
                el.contentEditable = "false";
                el.title = "Code comes from the companion repo. Change it there, then copy it in.";
            }
        });
        originals.current = els.map((el) => ({ html: el.innerHTML, tag: el.tagName }));
        source.current = src;
        root.contentEditable = "true";
        root.spellcheck = true;
        root.style.outline = "2px dashed rgba(128,128,128,0.5)";
        root.style.outlineOffset = "12px";
        root.addEventListener("input", markDirty);
        root.addEventListener("paste", pastePlain);
        const title = titleEl();
        if (title) {
            originalTitle.current = title.textContent ?? "";
            title.contentEditable = "true";
            title.addEventListener("input", markDirty);
        }
        setEditing(true);
        setStatus("Editing. Code blocks are locked.");
    };

    const toMarkdown = (el: HTMLElement): string => {
        const md = turndown.turndown(el.outerHTML).trim();
        return el.tagName === "P" && !el.querySelector("img") ? wrap(md) : md;
    };

    const save = async () => {
        const root = container();
        const src = source.current;
        if (!root || !src) return;
        const seen = new Set<number>();
        const pieces: Piece[] = [];
        root.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent?.trim();
                if (text) pieces.push({ original: null, markdown: wrap(text) });
                return;
            }
            if (!(node instanceof HTMLElement)) return;
            const idx = node.dataset.blk !== undefined ? Number(node.dataset.blk) : null;
            const fresh = idx === null || seen.has(idx); // a new element, or a copy made by pressing Enter
            const untouched =
                !fresh &&
                node.tagName === originals.current[idx!].tag &&
                (src.blocks[idx!].type === "code" || node.innerHTML === originals.current[idx!].html);
            if (idx !== null) seen.add(idx);
            pieces.push(untouched ? { original: idx, markdown: "" } : { original: null, markdown: toMarkdown(node) });
        });
        const body = rebuildBody(src.body, src.blocks, pieces);
        const newTitle = titleEl()?.textContent?.trim();
        const title = newTitle && newTitle !== originalTitle.current.trim() ? newTitle : undefined;

        setStatus("Saving");
        const res = await fetch(`/api/dev/post?slug=${slug}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ body, title, hash: src.hash }),
        });
        const data = await res.json();
        if (!res.ok) return setStatus(data.error ?? `Save failed: ${res.status}`);
        const where = data.copiedTo ? ` Copied to ${data.copiedTo.split("/").slice(-2).join("/")}.` : "";
        sessionStorage.setItem(SAVED_KEY, JSON.stringify({ y: window.scrollY, message: `Saved.${where}` }));
        setDirty(false);
        window.location.reload();
    };

    const cancel = () => window.location.reload();

    // Cmd+S saves while editing; leaving with unsaved edits asks first.
    useEffect(() => {
        if (!editing) return;
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                e.preventDefault();
                save();
            }
        };
        const onLeave = (e: BeforeUnloadEvent) => {
            if (dirty) e.preventDefault();
        };
        window.addEventListener("keydown", onKey);
        window.addEventListener("beforeunload", onLeave);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("beforeunload", onLeave);
        };
    });

    const format = (command: "bold" | "italic") => document.execCommand(command);

    const inlineCode = () => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
        const range = sel.getRangeAt(0);
        const code = document.createElement("code");
        code.textContent = range.toString();
        range.deleteContents();
        range.insertNode(code);
        markDirty();
    };

    const openLink = () => {
        const sel = window.getSelection();
        savedRange.current = sel && sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
        setLinkOpen(true);
    };

    const applyLink = () => {
        const sel = window.getSelection();
        if (savedRange.current && sel) {
            sel.removeAllRanges();
            sel.addRange(savedRange.current);
            document.execCommand("createLink", false, link);
            markDirty();
        }
        setLinkOpen(false);
        setLink("https://");
    };

    return (
        <Box
            position="fixed"
            bottom="4"
            right="4"
            zIndex="overlay"
            bg={bg}
            borderWidth="1px"
            borderColor={border}
            borderRadius="xl"
            boxShadow="lg"
            p="2"
            maxW="calc(100vw - 2rem)"
        >
            <HStack spacing="2" flexWrap="wrap">
                {!editing && (
                    <Button size="sm" onClick={start}>
                        Edit post
                    </Button>
                )}
                {editing && (
                    <>
                        <Tooltip label="Bold (Cmd+B)">
                            <IconButton aria-label="Bold" size="sm" variant="ghost" fontWeight="800" icon={<span>B</span>} onMouseDown={(e) => e.preventDefault()} onClick={() => format("bold")} />
                        </Tooltip>
                        <Tooltip label="Italic (Cmd+I)">
                            <IconButton aria-label="Italic" size="sm" variant="ghost" fontStyle="italic" icon={<span>I</span>} onMouseDown={(e) => e.preventDefault()} onClick={() => format("italic")} />
                        </Tooltip>
                        <Tooltip label="Inline code">
                            <IconButton aria-label="Inline code" size="sm" variant="ghost" fontFamily="mono" icon={<span>{"</>"}</span>} onMouseDown={(e) => e.preventDefault()} onClick={inlineCode} />
                        </Tooltip>
                        {!linkOpen ? (
                            <Button size="sm" variant="ghost" onMouseDown={(e) => e.preventDefault()} onClick={openLink}>
                                Link
                            </Button>
                        ) : (
                            <HStack spacing="1">
                                <Input size="sm" w="56" value={link} onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => e.key === "Enter" && applyLink()} autoFocus />
                                <Button size="sm" onClick={applyLink}>
                                    Add
                                </Button>
                            </HStack>
                        )}
                        <Button size="sm" variant="outline" onClick={cancel}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={save} isDisabled={!dirty}>
                            Save
                        </Button>
                    </>
                )}
            </HStack>
            {status && (
                <Text fontSize="xs" mt="1" px="1" opacity={0.8} maxW="md">
                    {status}
                </Text>
            )}
        </Box>
    );
};

export default DevEditor;
