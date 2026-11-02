import { FC, RefObject, useEffect, useState } from "react";

import { Box, Button, Collapse, Link, Text, VStack, useDisclosure } from "@chakra-ui/react";

import { ChevronDownIcon, ChevronUpIcon } from "utils/Icons";

interface Heading {
    id: string;
    text: string;
}

// The post's h2 headings, read from the rendered body (rehype-slug has already given each an id),
// plus the one the reader is currently in.
const useHeadings = (bodyRef: RefObject<HTMLElement>) => {
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        const elements = Array.from(bodyRef.current?.querySelectorAll<HTMLElement>("h2[id]") ?? []);
        setHeadings(elements.map((el) => ({ id: el.id, text: el.textContent ?? "" })));

        const onScroll = () => {
            let current: string | null = null;
            for (const el of elements) {
                if (el.getBoundingClientRect().top < 140) current = el.id;
            }
            setActiveId(current);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [bodyRef]);

    return { headings, activeId };
};

const Links: FC<{ headings: Heading[]; activeId: string | null; onPick?: () => void }> = ({
    headings,
    activeId,
    onPick,
}) => (
    <VStack as="ol" align="stretch" spacing="0" listStyleType="none">
        {headings.map((heading) => {
            const active = heading.id === activeId;
            return (
                <Box as="li" key={heading.id}>
                    <Link
                        href={`#${heading.id}`}
                        onClick={onPick}
                        display="block"
                        py="1.5"
                        pl="3"
                        borderLeft="2px solid"
                        borderColor={active ? "primary.500" : "whiteAlpha.200"}
                        color={active ? "white" : "gray.400"}
                        fontWeight={active ? "700" : "500"}
                        fontSize="sm"
                        lineHeight="1.4"
                        _hover={{ color: "white", textDecoration: "none" }}
                    >
                        {heading.text}
                    </Link>
                </Box>
            );
        })}
    </VStack>
);

const Title: FC = () => (
    <Text fontSize="xs" fontWeight="700" letterSpacing="wider" textTransform="uppercase" color="gray.500" mb="3">
        On this page
    </Text>
);

/** Sticky list beside the post, for wide screens. */
export const TableOfContentsSidebar: FC<{ bodyRef: RefObject<HTMLElement> }> = ({ bodyRef }) => {
    const { headings, activeId } = useHeadings(bodyRef);
    if (headings.length < 3) return null;

    return (
        <Box
            as="nav"
            aria-label="On this page"
            position="sticky"
            top="120px"
            maxH="calc(100vh - 160px)"
            overflowY="auto"
        >
            <Title />
            <Links headings={headings} activeId={activeId} />
        </Box>
    );
};

/** Collapsed box at the top of the post, for screens too narrow for the sidebar. */
export const TableOfContentsInline: FC<{ bodyRef: RefObject<HTMLElement> }> = ({ bodyRef }) => {
    const { headings, activeId } = useHeadings(bodyRef);
    const { isOpen, onToggle, onClose } = useDisclosure();
    if (headings.length < 3) return null;

    return (
        <Box as="nav" aria-label="On this page" borderWidth="1px" borderColor="whiteAlpha.200" borderRadius="lg" mt="8">
            <Button
                variant="ghost"
                w="100%"
                justifyContent="space-between"
                rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                onClick={onToggle}
                color="gray.200"
                fontSize="sm"
                px="4"
                aria-expanded={isOpen}
            >
                On this page ({headings.length} sections)
            </Button>
            <Collapse in={isOpen} animateOpacity>
                <Box px="4" pb="4">
                    <Links headings={headings} activeId={activeId} onPick={onClose} />
                </Box>
            </Collapse>
        </Box>
    );
};
