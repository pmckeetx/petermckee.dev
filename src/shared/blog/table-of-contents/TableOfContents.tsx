import { FC } from "react";

import { Box, Link, Stack, Text } from "@chakra-ui/react";

import { TocEntry } from "lib/blog-types";

interface Props {
    toc: TocEntry[];
    /** Minimum headings before a TOC is worth showing. */
    threshold?: number;
}

export const TableOfContents: FC<Props> = ({ toc, threshold = 3 }) => {
    if (toc.length < threshold) return null;

    return (
        <Box as="nav" aria-label="Table of contents" data-aos="fade" my="8" py="4">
            <Text textTransform="uppercase" fontSize="sm" fontWeight="700" color="gray.500" mb="3">
                On this page
            </Text>
            <Stack spacing="2" borderLeft="2px solid" borderColor="gray.600" pl="4">
                {toc.map((entry) => (
                    <Link
                        key={entry.id}
                        href={`#${entry.id}`}
                        pl={entry.depth === 3 ? "4" : "0"}
                        fontSize="sm"
                        fontWeight="600"
                        color="gray.500"
                        _hover={{ color: "primary.500", textDecoration: "none" }}
                    >
                        {entry.text}
                    </Link>
                ))}
            </Stack>
        </Box>
    );
};
