import { FC } from "react";
import NextLink from "next/link";

import {
    Box,
    Divider,
    Heading,
    Image,
    Link,
    ListItem,
    OrderedList,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    UnorderedList,
    useColorModeValue,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";

import { CodeBlock } from "shared/blog/code-block/CodeBlock";

interface Props {
    children: string;
}

// Prose renderer for blog post bodies. Distinct from shared/content/Content.tsx,
// whose list styling is tailored to the landing page. Headings carry ids from
// rehype-slug (for the table of contents + deep links); fenced code is syntax
// highlighted by rehype-highlight and wrapped with a copy button by CodeBlock.
export const BlogMarkdown: FC<Props> = ({ children }) => {
    const inlineCodeBg = useColorModeValue("blackAlpha.100", "whiteAlpha.200");
    const quoteBorder = useColorModeValue("primary.500", "primary.300");
    const quoteColor = useColorModeValue("gray.600", "gray.300");
    const borderColor = useColorModeValue("blackAlpha.200", "whiteAlpha.200");

    const headingProps = { scrollMarginTop: "120px", fontWeight: "700", lineHeight: "1.2" } as const;

    return (
        <Box fontSize={{ base: "md", lg: "lg" }}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug, rehypeHighlight]}
                components={{
                    h1: ({ node, ...props }) => (
                        <Heading as="h1" {...headingProps} fontSize={{ base: "3xl", md: "4xl" }} mt="10" mb="4" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                        <Heading as="h2" {...headingProps} fontSize={{ base: "2xl", md: "3xl" }} mt="12" mb="4" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                        <Heading as="h3" {...headingProps} fontSize={{ base: "xl", md: "2xl" }} mt="8" mb="3" {...props} />
                    ),
                    h4: ({ node, ...props }) => (
                        <Heading as="h4" {...headingProps} fontSize={{ base: "lg", md: "xl" }} mt="6" mb="2" {...props} />
                    ),
                    p: ({ node, ...props }) => <Text my="4" lineHeight="1.8" {...props} />,
                    a: ({ node, href, children, ...props }) => {
                        const url = href ?? "";
                        if (url.startsWith("/")) {
                            return (
                                <Link as={NextLink} href={url} {...props}>
                                    {children}
                                </Link>
                            );
                        }
                        if (url.startsWith("#")) {
                            return (
                                <Link href={url} {...props}>
                                    {children}
                                </Link>
                            );
                        }
                        return (
                            <Link href={url} isExternal {...props}>
                                {children}
                            </Link>
                        );
                    },
                    ul: ({ node, ...props }) => <UnorderedList spacing="2" my="4" pl="4" {...props} />,
                    ol: ({ node, ...props }) => <OrderedList spacing="2" my="4" pl="4" {...props} />,
                    li: ({ node, ...props }) => <ListItem lineHeight="1.7" {...props} />,
                    blockquote: ({ node, ...props }) => (
                        <Box
                            as="blockquote"
                            borderLeft="4px solid"
                            borderColor={quoteBorder}
                            color={quoteColor}
                            pl="5"
                            my="6"
                            fontStyle="italic"
                            sx={{ "& p": { my: 2 } }}
                            {...props}
                        />
                    ),
                    img: ({ node, src, alt, ...props }) => (
                        <Image src={src} alt={alt ?? ""} borderRadius="xl" my="6" {...props} />
                    ),
                    hr: () => <Divider my="10" borderColor={borderColor} />,
                    table: ({ node, ...props }) => (
                        <Box overflowX="auto" my="6">
                            <Table variant="simple" size="sm" {...props} />
                        </Box>
                    ),
                    thead: ({ node, ...props }) => <Thead {...props} />,
                    tbody: ({ node, ...props }) => <Tbody {...props} />,
                    tr: ({ node, ...props }) => <Tr {...props} />,
                    th: ({ node, ...props }) => <Th borderColor={borderColor} {...props} />,
                    td: ({ node, ...props }) => <Td borderColor={borderColor} {...props} />,
                    pre: ({ node, children }) => <CodeBlock>{children}</CodeBlock>,
                    code: ({ node, className, children, ...props }) => {
                        // Fenced code blocks carry a `language-*` / `hljs` class and are
                        // wrapped by `pre` (CodeBlock) — leave them for highlight.js.
                        if (className) {
                            return (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        }
                        // Inline code.
                        return (
                            <Box
                                as="code"
                                px="1.5"
                                py="0.5"
                                mx="0.5"
                                borderRadius="md"
                                bg={inlineCodeBg}
                                fontSize="0.85em"
                                fontFamily="mono"
                                {...props}
                            >
                                {children}
                            </Box>
                        );
                    },
                }}
            >
                {children}
            </ReactMarkdown>
        </Box>
    );
};
