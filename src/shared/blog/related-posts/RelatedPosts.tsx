import { FC } from "react";
import NextLink from "next/link";

import { Flex, Heading, LinkBox, LinkOverlay, SimpleGrid, Text, useColorModeValue } from "@chakra-ui/react";

import { PostMeta } from "lib/blog-types";
import { formatDate } from "lib/format";
import { Tags } from "shared/tags/Tags";

interface Props {
    posts: PostMeta[];
}

export const RelatedPosts: FC<Props> = ({ posts }) => {
    const borderColor = useColorModeValue("blackAlpha.200", "whiteAlpha.300");

    if (posts.length === 0) return null;

    return (
        <>
            <Heading as="h2" fontSize="2xl" mt="16" mb="6">
                Related posts
            </Heading>
            <SimpleGrid columns={{ base: 1, md: posts.length >= 3 ? 3 : posts.length }} spacing="4">
                {posts.map((post) => (
                    <LinkBox
                        key={post.slug}
                        as="article"
                        borderWidth="1px"
                        borderColor={borderColor}
                        borderRadius="xl"
                        p="5"
                        transition="all 0.2s ease-in-out"
                        _hover={{ borderColor: "primary.500", transform: "translateY(-2px)" }}
                    >
                        <Flex direction="column" h="100%" justifyContent="space-between" gap="3">
                            <LinkOverlay as={NextLink} href={`/blog/${post.slug}`}>
                                <Heading as="h3" fontSize="lg" lineHeight="1.3" _hover={{ color: "primary.500" }}>
                                    {post.title}
                                </Heading>
                            </LinkOverlay>
                            <Text fontSize="sm" color="gray.500" fontWeight="600">
                                {formatDate(post.date)} • {post.readingTime}
                            </Text>
                            <Tags id={`related-${post.slug}`} tags={post.tags} size="xs" />
                        </Flex>
                    </LinkBox>
                ))}
            </SimpleGrid>
        </>
    );
};
