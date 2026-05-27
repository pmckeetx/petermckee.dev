import { FC, ReactNode, useRef, useState } from "react";

import { Box, IconButton } from "@chakra-ui/react";

import { CheckIcon, CopyIcon } from "utils/Icons";

interface Props {
    children?: ReactNode;
}

// Wraps a fenced code block (the <code> element rehype-highlight produces) with a
// copy button. The highlight.js theme (imported in _app) styles `pre code.hljs`
// with the background, padding, and colors; we just round the corners and overlay
// the button. Copy reads the rendered text straight off the <pre>.
export const CodeBlock: FC<Props> = ({ children }) => {
    const preRef = useRef<HTMLPreElement>(null);
    const [copied, setCopied] = useState(false);

    const onCopy = () => {
        const text = preRef.current?.innerText ?? "";
        navigator.clipboard?.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <Box
            position="relative"
            my="6"
            sx={{
                "& pre": { margin: 0 },
                "& pre code.hljs": {
                    borderRadius: "lg",
                    fontSize: "sm",
                    lineHeight: "1.7",
                    padding: "1.25rem",
                },
            }}
        >
            <IconButton
                aria-label={copied ? "copied" : "copy code"}
                icon={copied ? <CheckIcon /> : <CopyIcon />}
                size="sm"
                position="absolute"
                top="2"
                right="2"
                zIndex="1"
                variant="ghost"
                color="whiteAlpha.700"
                bg="whiteAlpha.100"
                _hover={{ bg: "whiteAlpha.300", color: "white" }}
                _active={{ bg: "whiteAlpha.400" }}
                onClick={onCopy}
            />
            <pre ref={preRef}>{children}</pre>
        </Box>
    );
};
