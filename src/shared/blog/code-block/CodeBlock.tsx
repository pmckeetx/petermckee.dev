import { FC, ReactElement, ReactNode, isValidElement, useEffect, useRef, useState } from "react";

import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";

import { CheckIcon, CopyIcon } from "utils/Icons";

interface Props {
    children?: ReactNode;
}

// What the header bar calls each fence language. Anything not listed shows its own name.
const LABELS: Record<string, string> = {
    bash: "Terminal",
    sh: "Terminal",
    shell: "Terminal",
    zsh: "Terminal",
    console: "Terminal",
    text: "Text",
    plaintext: "Text",
    python: "Python",
    py: "Python",
    javascript: "JavaScript",
    js: "JavaScript",
    typescript: "TypeScript",
    ts: "TypeScript",
    tsx: "TSX",
    jsx: "JSX",
    json: "JSON",
    yaml: "YAML",
    yml: "YAML",
    toml: "TOML",
    rust: "Rust",
    go: "Go",
    html: "HTML",
    css: "CSS",
    diff: "Diff",
    sql: "SQL",
    markdown: "Markdown",
    md: "Markdown",
    dockerfile: "Dockerfile",
};

const SURFACE = "#22272e"; // github-dark-dimmed background, imported in _app
const BAR = "#1c2128";
const BORDER = "#373e47";

const languageOf = (children: ReactNode): string | null => {
    if (!isValidElement(children)) return null;
    const className: string = (children as ReactElement<{ className?: string }>).props.className ?? "";
    const match = className.match(/language-([\w-]+)/);
    return match ? match[1].toLowerCase() : null;
};

// Wraps a fenced code block (the <code> element rehype-highlight produces) in a panel with a header
// bar: the language on the left, a copy button on the right, so the button never sits on the code.
// Long lines scroll sideways inside the panel, since wrapping breaks indentation. When a block is too
// wide for the column, a fade on the right says there's more, and a Wrap toggle shows whole lines.
export const CodeBlock: FC<Props> = ({ children }) => {
    const preRef = useRef<HTMLPreElement>(null);
    const [copied, setCopied] = useState(false);
    const [wrap, setWrap] = useState(false);
    const [overflows, setOverflows] = useState(false);
    const [atEnd, setAtEnd] = useState(false);

    useEffect(() => {
        const pre = preRef.current;
        if (!pre) return;
        const measure = () => {
            setOverflows(pre.scrollWidth > pre.clientWidth + 1);
            setAtEnd(pre.scrollLeft + pre.clientWidth >= pre.scrollWidth - 1);
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(pre);
        pre.addEventListener("scroll", measure, { passive: true });
        return () => {
            observer.disconnect();
            pre.removeEventListener("scroll", measure);
        };
    }, [wrap]);
    const language = languageOf(children);
    const label = language ? (LABELS[language] ?? language) : "Code";

    const onCopy = () => {
        const text = preRef.current?.innerText ?? "";
        navigator.clipboard?.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <Box
            my="7"
            bg={SURFACE}
            borderWidth="1px"
            borderColor={BORDER}
            borderRadius="lg"
            overflow="hidden"
            position="relative"
            sx={{
                "& pre": {
                    margin: 0,
                    overflowX: "auto",
                    scrollbarWidth: "thin",
                    scrollbarColor: `${BORDER} transparent`,
                },
                "& pre::-webkit-scrollbar": { height: "8px" },
                "& pre::-webkit-scrollbar-thumb": { background: BORDER, borderRadius: "4px" },
                "& pre code.hljs": {
                    display: "block",
                    background: "transparent",
                    padding: { base: "1rem", md: "1.125rem 1.25rem" },
                    fontFamily: "mono",
                    fontSize: { base: "0.8125rem", md: "0.875rem" },
                    lineHeight: "1.7",
                    tabSize: 4,
                    overflowX: "visible",
                    width: wrap ? "auto" : "max-content",
                    minWidth: "100%",
                    whiteSpace: wrap ? "pre-wrap" : "pre",
                    overflowWrap: wrap ? "anywhere" : "normal",
                },
            }}
        >
            <Flex
                align="center"
                justify="space-between"
                bg={BAR}
                borderBottom="1px solid"
                borderColor={BORDER}
                px="4"
                py="1.5"
            >
                <Text fontFamily="mono" fontSize="xs" fontWeight="500" color="gray.300" letterSpacing="wide">
                    {label}
                </Text>
                <HStack spacing="1">
                    {(overflows || wrap) && (
                        <Button
                            size="xs"
                            variant="ghost"
                            color={wrap ? "white" : "gray.300"}
                            bg={wrap ? "whiteAlpha.100" : "transparent"}
                            fontWeight="600"
                            _hover={{ bg: "whiteAlpha.100", color: "white" }}
                            onClick={() => setWrap((w) => !w)}
                            aria-pressed={wrap}
                            title="Wrap long lines"
                        >
                            Wrap
                        </Button>
                    )}
                    <Button
                        size="xs"
                        variant="ghost"
                        color={copied ? "green.300" : "gray.300"}
                        leftIcon={copied ? <CheckIcon /> : <CopyIcon />}
                        fontWeight="600"
                        _hover={{ bg: "whiteAlpha.100", color: "white" }}
                        _active={{ bg: "whiteAlpha.200" }}
                        onClick={onCopy}
                        aria-label={copied ? "Copied" : "Copy code"}
                    >
                        {copied ? "Copied" : "Copy"}
                    </Button>
                </HStack>
            </Flex>
            <pre ref={preRef}>{children}</pre>
            {overflows && !wrap && !atEnd && (
                <Box
                    aria-hidden
                    position="absolute"
                    top="37px"
                    right="0"
                    bottom="0"
                    w="56px"
                    pointerEvents="none"
                    bgGradient={`linear(to-r, transparent, ${SURFACE})`}
                />
            )}
        </Box>
    );
};
