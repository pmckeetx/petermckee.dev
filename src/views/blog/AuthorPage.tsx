import { FC } from "react";

import { Box, Flex, Heading, HStack, IconButton, Image, Link, Text, useColorModeValue } from "@chakra-ui/react";

import { Author, PostMeta, Social } from "lib/blog-types";
import { PageHeader } from "shared/page-header/PageHeader";
import { BlogSeo } from "shared/blog/seo/BlogSeo";
import { BlogLayout } from "views/blog/BlogLayout";
import { BlogCard } from "views/blog/blog-card/BlogCard";
import { GitHubIcon, LinkedInIcon, MailIcon } from "utils/Icons";

interface Props {
    author: Author;
    posts: PostMeta[];
}

const socialIcon: Record<string, JSX.Element> = {
    github: <GitHubIcon />,
    linkedin: <LinkedInIcon />,
    mail: <MailIcon />,
};

const AuthorSocials: FC<{ socials: Social[] }> = ({ socials }) => (
    <HStack spacing="3" mt="4">
        {socials.map(
            (social) =>
                socialIcon[social.type] && (
                    <Link key={social.type} href={social.link} isExternal aria-label={social.type}>
                        <IconButton
                            aria-label={social.type}
                            icon={socialIcon[social.type]}
                            variant="icon"
                            fontSize="22px"
                        />
                    </Link>
                ),
        )}
    </HStack>
);

export const AuthorPage: FC<Props> = ({ author, posts }) => {
    const metaColor = useColorModeValue("gray.500", "gray.400");

    return (
        <BlogLayout secondaryHref="/blog" secondaryLabel="All posts">
            <BlogSeo title={`${author.name} • Peter McKee`} description={author.bio} path={`/blog/author/${author.id}`} type="website" />

            <Flex gap={{ base: 6, md: 10 }} direction={{ base: "column", md: "row" }} align={{ md: "center" }}>
                <Image
                    src={author.headshot}
                    alt={author.name}
                    borderRadius="2xl"
                    boxSize={{ base: "120px", md: "160px" }}
                    objectFit="cover"
                    flexShrink={0}
                />
                <Box>
                    <Heading fontSize={{ base: "4xl", md: "5xl" }} lineHeight="1">
                        {author.name}
                    </Heading>
                    <Text fontSize={{ base: "md", lg: "lg" }} mt="4" maxW="container.sm" lineHeight="1.7">
                        {author.bio}
                    </Text>
                    <AuthorSocials socials={author.socials} />
                </Box>
            </Flex>

            <PageHeader label={`${posts.length} article${posts.length === 1 ? "" : "s"}`} />

            {posts.length > 0 ? (
                <Box>
                    {posts.map((post) => (
                        <BlogCard key={post.slug} post={post} />
                    ))}
                </Box>
            ) : (
                <Text fontSize="lg" color={metaColor}>
                    No articles yet.
                </Text>
            )}
        </BlogLayout>
    );
};
