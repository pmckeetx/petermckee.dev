import { FC } from "react";

import NextLink from "next/link";

import { Box, Heading, Flex, HStack, Link, Text } from "@chakra-ui/react";

import { configs } from "shared/content/Content";
import { PageHeader } from "shared/page-header/PageHeader";
import { onMailTo } from "utils/Functions";
import { Socials } from "shared/socials/Socials";
import { NAV_ITEMS } from "shared/site-header/SiteHeader";

const headerStyles = {
    cursor: "pointer",
    transition: "color 0.2s ease-in-out",
    isTruncated: true,
    fontSize: { base: "2xl", md: "3xl" },
    _hover: { color: "primary.500" },
    _active: { color: "primary.500" },
};

export const Footer: FC = () => {
    return (
        <>
            <PageHeader label="SAY HI" />
            <Flex pb="2" gap="3" overflow="hidden" alignItems="center">
                <Heading {...headerStyles} onClick={onMailTo} fontSize="2xl">
                    {configs.common.email}
                </Heading>
            </Flex>
            <Text>
                If you want to know more about my experiences and journey, or just talk in general, get in touch! ✌️
            </Text>
            <Box pt="16">
                <Socials delay={100} exclude={["mail"]} />
            </Box>
            <HStack
                as="nav"
                aria-label="Footer"
                spacing={{ base: 5, md: 8 }}
                rowGap="3"
                wrap="wrap"
                justifyContent={{ base: "center", md: "flex-start" }}
                pt="12"
                mt="12"
                borderTop="1px solid"
                borderColor="whiteAlpha.200"
            >
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.label}
                        as={NextLink}
                        href={item.href}
                        color="gray.300"
                        fontWeight="600"
                        _hover={{ color: "primary.500" }}
                    >
                        {item.label}
                    </Link>
                ))}
                {/* A static file, so a plain link rather than a client-side route change. */}
                <Link href="/rss.xml" color="gray.300" fontWeight="600" _hover={{ color: "primary.500" }}>
                    RSS
                </Link>
            </HStack>
            <Flex
                pt="4"
                pb="2"
                fontSize="sm"
                color="gray.500"
                justifyContent={{ base: "center", md: "space-between" }}
                direction={{ base: "column", md: "row" }}
            >
                <Text>This site is hand-crafted, with care by me.</Text>
                <Text>&copy; {new Date().getFullYear()} All rights reserved.</Text>
            </Flex>
        </>
    );
};
