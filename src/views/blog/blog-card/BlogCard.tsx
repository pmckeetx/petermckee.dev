import { FC } from "react";
import NextLink from "next/link";

import { Box, Flex, Heading, Image, LinkBox, LinkOverlay, Text, useColorModeValue } from "@chakra-ui/react";

import { PostMeta } from "lib/blog-types";
import { formatDate } from "lib/format";
import { Tags } from "shared/tags/Tags";

interface Props {
    post: PostMeta;
    featured?: boolean;
}

export const BlogCard: FC<Props> = ({ post, featured = false }) => {
    const metaColor = useColorModeValue("gray.500", "gray.400");

    return (
        <LinkBox
            as="article"
            data-aos="fade-up"
            data-aos-offset="120"
            py={featured ? "6" : "8"}
            borderTopWidth={featured ? "0" : "1px"}
            borderColor={useColorModeValue("blackAlpha.200", "whiteAlpha.200")}
        >
            <Flex
                direction={{ base: "column", md: featured ? "row" : "column" }}
                gap={featured ? { base: 6, md: 10 } : 4}
                alignItems={featured ? { md: "center" } : undefined}
            >
                {post.hero && (
                    <Box flexShrink={0} flexBasis={featured ? { md: "45%" } : undefined} w="100%">
                        <Image
                            src={post.hero}
                            alt={post.heroAlt || post.title}
                            borderRadius="xl"
                            objectFit="cover"
                            w="100%"
                            h={featured ? { base: "220px", md: "320px" } : "200px"}
                            transition="transform 0.4s ease-in-out"
                            _hover={{ transform: "scale(1.01)" }}
                        />
                    </Box>
                )}

                <Box flex="1">
                    {featured && (
                        <Text
                            textTransform="uppercase"
                            fontSize="xs"
                            fontWeight="700"
                            letterSpacing="wider"
                            color="primary.500"
                            mb="2"
                        >
                            Featured
                        </Text>
                    )}
                    <Text color={metaColor} fontSize="sm" fontWeight="600">
                        {formatDate(post.date)} • {post.readingTime}
                    </Text>
                    <LinkOverlay as={NextLink} href={`/blog/${post.slug}`}>
                        <Heading
                            fontSize={featured ? { base: "3xl", md: "4xl" } : "2xl"}
                            lineHeight="1.1"
                            mt="2"
                            _hover={{ color: "primary.500" }}
                        >
                            {post.title}
                        </Heading>
                    </LinkOverlay>
                    <Text mt="3" fontSize={{ base: "md", lg: "lg" }} opacity="0.85" noOfLines={3}>
                        {post.excerpt}
                    </Text>
                    <Tags id={post.slug} tags={post.tags} />
                </Box>
            </Flex>
        </LinkBox>
    );
};
