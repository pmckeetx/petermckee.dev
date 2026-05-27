import { FC, useState } from "react";
import { useRouter } from "next/router";

import { Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";

import { PostMeta } from "lib/blog-types";
import { PageHeader } from "shared/page-header/PageHeader";
import { SearchBar } from "shared/blog/search-bar/SearchBar";
import { TagFilter } from "shared/blog/tag-filter/TagFilter";
import { BlogSeo } from "shared/blog/seo/BlogSeo";
import { BlogLayout } from "views/blog/BlogLayout";
import { BlogCard } from "views/blog/blog-card/BlogCard";

interface Props {
    posts: PostMeta[];
    tags: string[];
    /** Set on /blog/tag/[tag] pages. */
    activeTag?: string | null;
}

const SUBTITLE = "Notes on building software — databases, systems, and AI.";

export const BlogLanding: FC<Props> = ({ posts, tags, activeTag = null }) => {
    const router = useRouter();
    const [query, setQuery] = useState("");

    // Tag selection navigates (so tag views are prerendered + shareable); search
    // filters the currently shown set client-side.
    const onSelectTag = (tag: string | null) => {
        setQuery("");
        router.push(tag === null ? "/blog" : `/blog/tag/${encodeURIComponent(tag)}`);
    };

    const q = query.trim().toLowerCase();
    const filtered = q
        ? posts.filter(
              (post) =>
                  post.title.toLowerCase().includes(q) ||
                  post.excerpt.toLowerCase().includes(q) ||
                  post.tags.some((tag) => tag.toLowerCase().includes(q)),
          )
        : posts;

    const featured = activeTag === null && !q ? posts.filter((post) => post.featured) : [];
    const showFeatured = featured.length > 0;
    const list = showFeatured ? filtered.filter((post) => !post.featured) : filtered;

    const heading = activeTag ? `Tagged “${activeTag}”` : "Writing";
    const seoTitle = activeTag ? `${activeTag} • Blog • Peter McKee` : "Blog • Peter McKee";
    const seoPath = activeTag ? `/blog/tag/${encodeURIComponent(activeTag)}` : "/blog";

    return (
        <BlogLayout secondaryHref={activeTag ? "/blog" : undefined} secondaryLabel="All posts">
            <BlogSeo title={seoTitle} description={SUBTITLE} path={seoPath} type="website" />

            <Heading fontSize={{ base: "4xl", md: "6xl" }} lineHeight="1">
                {heading}
            </Heading>
            <Text fontSize={{ base: "lg", md: "xl" }} color="gray.500" fontWeight="600" mt="3">
                {SUBTITLE}
            </Text>

            <Stack spacing="5" mt="10">
                <SearchBar value={query} onChange={setQuery} />
                <TagFilter tags={tags} selected={activeTag} onSelect={onSelectTag} />
            </Stack>

            {showFeatured && (
                <>
                    <PageHeader label="Featured" />
                    <Stack spacing="6">
                        {featured.map((post) => (
                            <BlogCard key={post.slug} post={post} featured />
                        ))}
                    </Stack>
                </>
            )}

            <PageHeader label={activeTag ? `${list.length} article${list.length === 1 ? "" : "s"}` : "Latest"} />
            {list.length > 0 ? (
                <Box>
                    {list.map((post) => (
                        <BlogCard key={post.slug} post={post} />
                    ))}
                </Box>
            ) : (
                <Text fontSize="lg" color="gray.500">
                    No articles found{q ? ` for “${query.trim()}”` : ""}.
                </Text>
            )}
        </BlogLayout>
    );
};
