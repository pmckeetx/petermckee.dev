import { FC, useState } from "react";

import { Box, Flex, Heading, Image, Link, SimpleGrid, Stack, Text, useColorModeValue } from "@chakra-ui/react";

import data from "content/publications/publications-config.json";
import { PageHeader } from "shared/page-header/PageHeader";
import { TagFilter } from "shared/blog/tag-filter/TagFilter";
import { BlogSeo } from "shared/blog/seo/BlogSeo";
import { BlogLayout } from "views/blog/BlogLayout";
import { PressQuoteCard } from "views/speaking/PressQuoteCard";
import { LinkIcon } from "utils/Icons";

type ItemType = "article" | "talk" | "podcast";

interface Item {
    id: string;
    type: ItemType;
    title: string;
    outlet: string;
    era: string;
    date?: string;
    link?: string;
    description: string;
}

interface Video {
    id: string;
    youtubeId: string;
    title: string;
    outlet: string;
    views: string;
    likes: string;
    featured?: boolean;
}

const items = data.items as Item[];
const videos = data.videos as Video[];

const FILTERS = ["Videos", "Press", "Articles", "Talks", "Podcasts & Interviews"] as const;
type Filter = (typeof FILTERS)[number];

const SECTIONS: Array<{ filter: Filter; type: ItemType }> = [
    { filter: "Articles", type: "article" },
    { filter: "Talks", type: "talk" },
    { filter: "Podcasts & Interviews", type: "podcast" },
];

const TOTAL = items.length + videos.length;
const SUBTITLE = `Articles, talks, podcasts, and videos: ${TOTAL}+ pieces from Docker, Sonar, and beyond.`;

const youtubeUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

const VideoCard: FC<{ video: Video; delay: number }> = ({ video, delay }) => {
    const metaColor = useColorModeValue("gray.500", "gray.400");

    return (
        <Link
            href={youtubeUrl(video.youtubeId)}
            isExternal
            data-aos="fade-up"
            data-aos-delay={delay}
            display="block"
            _hover={{ textDecoration: "none" }}
            role="group"
        >
            <Box position="relative" borderRadius="md" overflow="hidden" bg="blackAlpha.400">
                <Image
                    src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                    alt={video.title}
                    w="100%"
                    style={{ aspectRatio: "16 / 9" }}
                    objectFit="cover"
                    loading="lazy"
                    transition="transform 0.3s ease-in-out"
                    _groupHover={{ transform: "scale(1.03)" }}
                />
                <Flex position="absolute" inset="0" alignItems="center" justifyContent="center">
                    <Flex
                        w={video.featured ? "72px" : "52px"}
                        h={video.featured ? "72px" : "52px"}
                        borderRadius="full"
                        bg="primary.500"
                        color="white"
                        alignItems="center"
                        justifyContent="center"
                        fontSize={video.featured ? "2xl" : "lg"}
                        shadow="lg"
                        opacity="0.92"
                        _groupHover={{ opacity: 1 }}
                        aria-hidden
                    >
                        ▶
                    </Flex>
                </Flex>
            </Box>
            <Heading fontSize={video.featured ? { base: "xl", md: "2xl" } : "lg"} lineHeight="1.25" mt="4">
                {video.title}
            </Heading>
            <Text fontSize="sm" color={metaColor} mt="1">
                {[video.outlet, video.views, video.likes].join(" · ")}
            </Text>
        </Link>
    );
};

const ViewerComments: FC = () => {
    const quoteColor = useColorModeValue("gray.700", "gray.200");
    const metaColor = useColorModeValue("gray.500", "gray.400");

    return (
        <Stack spacing="5" justifyContent="center" h="100%">
            {data.viewerComments.map((comment, idx) => (
                <Box
                    key={comment.author}
                    data-aos="fade-up"
                    data-aos-delay={idx * 80}
                    borderLeft="3px solid"
                    borderLeftColor="primary.500"
                    pl="4"
                >
                    <Text fontStyle="italic" color={quoteColor}>
                        &ldquo;{comment.quote}&rdquo;
                    </Text>
                    <Text fontSize="xs" color={metaColor} mt="1">
                        {comment.author} on YouTube
                    </Text>
                </Box>
            ))}
        </Stack>
    );
};

const PublicationRow: FC<{ item: Item }> = ({ item }) => {
    const borderColor = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
    const metaColor = useColorModeValue("gray.500", "gray.400");
    const descColor = useColorModeValue("gray.600", "gray.300");

    const meta = [item.outlet, item.date, item.era].filter(Boolean).join(" · ");

    return (
        <Flex
            id={`publication-${item.id}`}
            py="5"
            borderBottom="1px solid"
            borderColor={borderColor}
            gap="4"
            alignItems="flex-start"
            justifyContent="space-between"
        >
            <Box flex="1" minW="0">
                <Heading fontSize={{ base: "md", md: "lg" }} lineHeight="1.3">
                    {item.link ? (
                        <Link href={item.link} isExternal _hover={{ color: "primary.500", textDecoration: "none" }}>
                            {item.title}
                        </Link>
                    ) : (
                        item.title
                    )}
                </Heading>
                <Text fontSize="sm" color={metaColor} mt="1">
                    {meta}
                </Text>
                <Text fontSize="sm" color={descColor} mt="2">
                    {item.description}
                </Text>
            </Box>
            {item.link && (
                <Link
                    href={item.link}
                    isExternal
                    aria-label={`Open ${item.title}`}
                    color="primary.500"
                    fontSize="lg"
                    mt="1"
                    flexShrink={0}
                >
                    <LinkIcon />
                </Link>
            )}
        </Flex>
    );
};

export const Publications: FC = () => {
    const [filter, setFilter] = useState<Filter | null>(null);
    const show = (f: Filter) => filter === null || filter === f;

    const featured = videos.find((v) => v.featured);
    const moreVideos = videos.filter((v) => !v.featured);
    const linkColor = useColorModeValue("gray.600", "gray.300");

    return (
        <BlogLayout secondaryHref="/" secondaryLabel="Home">
            <BlogSeo title="Publications • Peter McKee" description={SUBTITLE} path="/publications" type="website" />

            <Heading fontSize={{ base: "4xl", md: "6xl" }} lineHeight="1">
                Publications
            </Heading>
            <Text fontSize={{ base: "lg", md: "xl" }} color="gray.500" fontWeight="600" mt="3">
                {SUBTITLE}
            </Text>

            <Box mt="10">
                <TagFilter tags={[...FILTERS]} selected={filter} onSelect={(tag) => setFilter(tag as Filter | null)} />
            </Box>

            {show("Videos") && (
                <>
                    <PageHeader label="Videos" />
                    {featured && (
                        <SimpleGrid columns={{ base: 1, lg: 5 }} spacing={{ base: 8, lg: 10 }}>
                            <Box gridColumn={{ lg: "span 3" }}>
                                <VideoCard video={featured} delay={0} />
                            </Box>
                            <Box gridColumn={{ lg: "span 2" }}>
                                <ViewerComments />
                            </Box>
                        </SimpleGrid>
                    )}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing="8" mt="12">
                        {moreVideos.map((video, idx) => (
                            <VideoCard key={video.id} video={video} delay={idx * 100} />
                        ))}
                    </SimpleGrid>
                </>
            )}

            {show("Press") && (
                <>
                    <PageHeader label="Press" />
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="6">
                        {data.press.map((item, idx) => (
                            <PressQuoteCard key={item.id} delay={(idx % 3) * 100} {...item} />
                        ))}
                    </SimpleGrid>
                </>
            )}

            {SECTIONS.filter((s) => show(s.filter)).map((section) => {
                const list = items.filter((item) => item.type === section.type);
                return (
                    <Box key={section.type}>
                        <PageHeader label={`${section.filter} (${list.length})`} />
                        <Box>
                            {list.map((item) => (
                                <PublicationRow key={item.id} item={item} />
                            ))}
                        </Box>
                    </Box>
                );
            })}

            {filter === null && (
                <>
                    <PageHeader label="Elsewhere" />
                    <Flex wrap="wrap" gap={{ base: 4, md: 8 }}>
                        {data.profiles.map((profile) => (
                            <Link
                                key={profile.link}
                                href={profile.link}
                                isExternal
                                color={linkColor}
                                fontWeight="600"
                                _hover={{ color: "primary.500" }}
                            >
                                {profile.label} ↗
                            </Link>
                        ))}
                    </Flex>
                </>
            )}
        </BlogLayout>
    );
};
