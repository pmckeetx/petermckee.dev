import { FC, useRef } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";

import { Box, Divider, Flex, Grid, Heading, Image, Link, Text, useColorModeValue } from "@chakra-ui/react";

import { Author, Post, PostMeta } from "lib/blog-types";
import { formatDate } from "lib/format";
import { Tags } from "shared/tags/Tags";
import { BlogMarkdown } from "shared/blog/markdown/BlogMarkdown";
import { BlogSeo } from "shared/blog/seo/BlogSeo";
import { RelatedPosts } from "shared/blog/related-posts/RelatedPosts";
import { PrevNext } from "shared/blog/prev-next/PrevNext";
import { TableOfContentsInline, TableOfContentsSidebar } from "shared/blog/toc/TableOfContents";
import { ArrowLeftIcon, ArrowRightIcon } from "utils/Icons";
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
    const bodyRef = useRef<HTMLDivElement>(null);

    return (
        <BlogLayout>
            <BlogSeo
                title={`${meta.title} • Peter McKee`}
                description={meta.excerpt}
                path={`/blog/${meta.slug}`}
                image={meta.hero}
                type="article"
                publishedTime={meta.date}
            />

            <Grid
                templateColumns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 1fr) 220px" }}
                columnGap="16"
                maxW={{ base: "container.md", xl: "1100px" }}
                mx="auto"
            >
                <Box as="article" minW="0" maxW="820px">
                    <Link
                        as={NextLink}
                        href="/blog"
                        display="inline-flex"
                        alignItems="center"
                        gap="1"
                        color="gray.400"
                        fontSize="sm"
                        fontWeight="600"
                        mb="6"
                        _hover={{ color: "primary.500", textDecoration: "none" }}
                    >
                        <ArrowLeftIcon /> All posts
                    </Link>
                    <Tags
                        id={meta.slug}
                        tags={meta.tags}
                        onClick={(tag) => router.push(`/blog/tag/${encodeURIComponent(tag)}`)}
                    />

                    <Heading as="h1" fontSize={{ base: "4xl", md: "5xl" }} lineHeight="1.1" mt="2">
                        {meta.title}
                    </Heading>

                    <Flex align="center" gap="2" mt="4" color={metaColor} fontSize="sm" fontWeight="600" wrap="wrap">
                        {author && (
                            <>
                                <Link
                                    as={NextLink}
                                    href={`/blog/author/${author.id}`}
                                    _hover={{ color: "primary.500" }}
                                >
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

                    <Box display={{ base: "block", xl: "none" }}>
                        <TableOfContentsInline bodyRef={bodyRef} />
                    </Box>

                    <Box mt="8" ref={bodyRef}>
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

                    <Link
                        as={NextLink}
                        href="/blog"
                        display="inline-flex"
                        alignItems="center"
                        gap="1"
                        mt="10"
                        color="primary.500"
                        fontWeight="700"
                        _hover={{ textDecoration: "none", color: "primary.300" }}
                    >
                        Browse all posts <ArrowRightIcon />
                    </Link>
                </Box>

                <Box as="aside" display={{ base: "none", xl: "block" }} pt="12">
                    <TableOfContentsSidebar bodyRef={bodyRef} />
                </Box>
            </Grid>
        </BlogLayout>
    );
};
