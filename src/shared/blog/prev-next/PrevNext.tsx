import { FC } from "react";
import NextLink from "next/link";

import { Box, Flex, LinkBox, LinkOverlay, Text, useColorModeValue } from "@chakra-ui/react";

import { PostMeta } from "lib/blog-types";
import { ArrowLeftIcon, ArrowRightIcon } from "utils/Icons";

interface Props {
    older: PostMeta | null;
    newer: PostMeta | null;
}

const NeighborCard: FC<{ post: PostMeta; align: "left" | "right" }> = ({ post, align }) => {
    const borderColor = useColorModeValue("blackAlpha.200", "whiteAlpha.300");
    const isLeft = align === "left";

    return (
        <LinkBox
            as="article"
            flex="1"
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="xl"
            p="5"
            transition="all 0.2s ease-in-out"
            _hover={{ borderColor: "primary.500", transform: "translateY(-2px)" }}
            textAlign={isLeft ? "left" : "right"}
        >
            <Flex
                align="center"
                gap="1"
                justifyContent={isLeft ? "flex-start" : "flex-end"}
                color="gray.500"
                fontSize="sm"
                fontWeight="700"
                textTransform="uppercase"
            >
                {isLeft && <ArrowLeftIcon />}
                <Text as="span">{isLeft ? "Older" : "Newer"}</Text>
                {!isLeft && <ArrowRightIcon />}
            </Flex>
            <LinkOverlay as={NextLink} href={`/blog/${post.slug}`}>
                <Text fontWeight="700" fontSize="lg" mt="1" _hover={{ color: "primary.500" }}>
                    {post.title}
                </Text>
            </LinkOverlay>
        </LinkBox>
    );
};

export const PrevNext: FC<Props> = ({ older, newer }) => {
    if (!older && !newer) return null;

    return (
        <Flex gap="4" mt="12" direction={{ base: "column", md: "row" }}>
            {older ? <NeighborCard post={older} align="left" /> : <Box flex="1" />}
            {newer ? <NeighborCard post={newer} align="right" /> : <Box flex="1" />}
        </Flex>
    );
};
