import type { GetStaticProps, NextPage } from "next";

import { PostMeta } from "lib/blog-types";
import { getAllPostsMeta, getAllTags } from "lib/blog";
import { BlogLanding } from "views/blog/BlogLanding";

interface Props {
    posts: PostMeta[];
    tags: string[];
}

const BlogIndexPage: NextPage<Props> = ({ posts, tags }) => <BlogLanding posts={posts} tags={tags} />;

export const getStaticProps: GetStaticProps<Props> = async () => ({
    props: {
        posts: getAllPostsMeta(),
        tags: getAllTags(),
    },
});

export default BlogIndexPage;
