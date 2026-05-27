import type { GetStaticPaths, GetStaticProps, NextPage } from "next";

import { Author, Post, PostMeta } from "lib/blog-types";
import { getAllSlugs, getAuthor, getPostBySlug, getPrevNext, getRelated } from "lib/blog";
import { BlogPost } from "views/blog/BlogPost";

interface Props {
    post: Post;
    author: Author | null;
    related: PostMeta[];
    older: PostMeta | null;
    newer: PostMeta | null;
}

const BlogPostPage: NextPage<Props> = (props) => <BlogPost {...props} />;

export const getStaticPaths: GetStaticPaths = async () => ({
    paths: getAllSlugs().map((slug) => ({ params: { slug } })),
    fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
    const slug = params?.slug as string;
    const post = getPostBySlug(slug);
    if (!post) return { notFound: true };

    const { older, newer } = getPrevNext(slug);

    return {
        props: {
            post,
            author: getAuthor(post.meta.author),
            related: getRelated(slug),
            older,
            newer,
        },
    };
};

export default BlogPostPage;
