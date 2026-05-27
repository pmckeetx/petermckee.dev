import { FC } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";

import { Box, Divider, Flex, Heading, Image, Link, Text, useColorModeValue } from "@chakra-ui/react";

import { Author, Post, PostMeta } from "lib/blog-types";
import { formatDate } from "lib/format";
import { Tags } from "shared/tags/Tags";
import { BlogMarkdown } from "shared/blog/markdown/BlogMarkdown";
import { BlogSeo } from "shared/blog/seo/BlogSeo";
import { RelatedPosts } from "shared/blog/related-posts/RelatedPosts";
import { PrevNext } from "shared/blog/prev-next/PrevNext";
import { BlogLayout } from "views/blog/BlogLayout";

interface Props {
    post: Post;
    author: Author | null;
    related: PostMeta[];
    older: PostMeta | null;
    newer: PostMeta | null;
}

export const BlogPost: FC<Props> = ({ post, author, related, older, newer }) => {
    const router = useRouter();
    const { meta, body } = post;
    const metaColor = useColorModeValue("gray.500", "gray.400");
    const borderColor = useColorModeValue("blackAlpha.200", "whiteAlpha.200");

    return (
        <BlogLayout secondaryHref="/blog" secondaryLabel="All posts">
            <BlogSeo
                title={`${meta.title} • Peter McKee`}
                description={meta.excerpt}
                path={`/blog/${meta.slug}`}
                image={meta.hero}
                type="article"
                publishedTime={meta.date}
            />

            <Box as="article" maxW="container.md" mx="auto">
                <Tags id={meta.slug} tags={meta.tags} onClick={(tag) => router.push(`/blog/tag/${encodeURIComponent(tag)}`)} />

                <Heading as="h1" fontSize={{ base: "4xl", md: "5xl" }} lineHeight="1.1" mt="2">
                    {meta.title}
                </Heading>

                <Flex align="center" gap="2" mt="4" color={metaColor} fontSize="sm" fontWeight="600" wrap="wrap">
                    {author && (
                        <>
                            <Link as={NextLink} href={`/blog/author/${author.id}`} _hover={{ color: "primary.500" }}>
                                {author.name}
                            </Link>
                            <Text as="span">•</Text>
                        </>
                    )}
                    <Text as="span">{formatDate(meta.date)}</Text>
                    <Text as="span">•</Text>
                    <Text as="span">{meta.readingTime}</Text>
                </Flex>

                {meta.hero && (
                    <Image
                        src={meta.hero}
                        alt={meta.heroAlt || meta.title}
                        borderRadius="2xl"
                        w="100%"
                        maxH="420px"
                        objectFit="cover"
                        mt="8"
                    />
                )}

                <Box mt="8">
                    <BlogMarkdown>{body}</BlogMarkdown>
                </Box>

                {author && (
                    <Flex
                        mt="16"
                        p="6"
                        gap="5"
                        borderWidth="1px"
                        borderColor={borderColor}
                        borderRadius="2xl"
                        direction={{ base: "column", sm: "row" }}
                        align={{ base: "flex-start", sm: "center" }}
                    >
                        <Image
                            src={author.headshot}
                            alt={author.name}
                            borderRadius="full"
                            boxSize="72px"
                            objectFit="cover"
                            flexShrink={0}
                        />
                        <Box>
                            <Text fontWeight="700" fontSize="lg">
                                {author.name}
                            </Text>
                            <Text color={metaColor} fontSize="sm" mt="1" noOfLines={3}>
                                {author.bio}
                            </Text>
                            <Link
                                as={NextLink}
                                href={`/blog/author/${author.id}`}
                                color="primary.500"
                                fontWeight="600"
                                fontSize="sm"
                                mt="2"
                                display="inline-block"
                            >
                                More from {author.name} →
                            </Link>
                        </Box>
                    </Flex>
                )}

                <PrevNext older={older} newer={newer} />

                <Divider my="12" borderColor={borderColor} />
                <RelatedPosts posts={related} />
            </Box>
        </BlogLayout>
    );
};
