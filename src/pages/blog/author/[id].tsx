import type { GetStaticPaths, GetStaticProps, NextPage } from "next";

import { Author, PostMeta } from "lib/blog-types";
import { getAuthor, getAuthors, getPostsByAuthor } from "lib/blog";
import { AuthorPage } from "views/blog/AuthorPage";

interface Props {
    author: Author;
    posts: PostMeta[];
}

const AuthorRoute: NextPage<Props> = ({ author, posts }) => <AuthorPage author={author} posts={posts} />;

export const getStaticPaths: GetStaticPaths = async () => ({
    paths: getAuthors().map((author) => ({ params: { id: author.id } })),
    fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
    const id = params?.id as string;
    const author = getAuthor(id);
    if (!author) return { notFound: true };

    return {
        props: {
            author,
            posts: getPostsByAuthor(id),
        },
    };
};

export default AuthorRoute;
