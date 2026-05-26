import { FC } from "react";

import { Box, Flex, Heading, Link, Text, useColorModeValue } from "@chakra-ui/react";

import { Tags } from "shared/tags/Tags";
import { LinkIcon } from "utils/Icons";

interface Props {
    id: string;
    title: string;
    outlet: string;
    year?: string;
    link?: string;
    tags?: string[];
    description: string;
    delay?: number;
}

export const HighlightCard: FC<Props> = ({ id, title, outlet, year, link, tags, description, delay = 0 }) => {
    const cardBg = useColorModeValue("blackAlpha.50", "whiteAlpha.50");
    const metaColor = useColorModeValue("gray.500", "gray.400");

    const meta = [year, outlet].filter(Boolean).join(" · ");

    return (
        <Flex
            id={`highlight-card-${id}`}
            data-aos="fade-up"
            data-aos-delay={delay}
            direction="column"
            bg={cardBg}
            borderRadius="md"
            p={{ base: "5", md: "6" }}
            transition="0.2s ease-in-out"
            transitionProperty="transform, box-shadow"
            _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
            h="100%"
        >
            <Box flex="1">
                <Heading fontSize={{ base: "lg", md: "xl" }} lineHeight="1.25">
                    {link ? (
                        <Link href={link} isExternal _hover={{ color: "primary.500", textDecoration: "none" }}>
                            {title}
                        </Link>
                    ) : (
                        title
                    )}
                </Heading>
                {meta && (
                    <Text fontSize="sm" color={metaColor} mt="1">
                        {meta}
                    </Text>
                )}
                <Text fontSize="md" mt="3">
                    {description}
                </Text>
                {tags && tags.length > 0 && <Tags id={id} tags={tags} size="xs" />}
            </Box>
            {link && (
                <Flex mt="4" alignItems="center">
                    <Link
                        href={link}
                        isExternal
                        color="primary.500"
                        fontWeight="600"
                        fontSize="sm"
                        display="inline-flex"
                        alignItems="center"
                        gap="2"
                    >
                        <Box as="span">View</Box>
                        <LinkIcon />
                    </Link>
                </Flex>
            )}
        </Flex>
    );
};
