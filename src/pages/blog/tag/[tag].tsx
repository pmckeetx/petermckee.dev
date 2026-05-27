import type { GetStaticPaths, GetStaticProps, NextPage } from "next";

import { PostMeta } from "lib/blog-types";
import { getAllTags, getPostsByTag } from "lib/blog";
import { BlogLanding } from "views/blog/BlogLanding";

interface Props {
    posts: PostMeta[];
    tags: string[];
    activeTag: string;
}

const TagPage: NextPage<Props> = ({ posts, tags, activeTag }) => (
    <BlogLanding posts={posts} tags={tags} activeTag={activeTag} />
);

export const getStaticPaths: GetStaticPaths = async () => ({
    paths: getAllTags().map((tag) => ({ params: { tag } })),
    fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
    const tag = params?.tag as string;
    const posts = getPostsByTag(tag);
    if (posts.length === 0) return { notFound: true };

    return {
        props: {
            posts,
            tags: getAllTags(),
            activeTag: tag,
        },
    };
};

export default TagPage;
