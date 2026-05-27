import { FC } from "react";
import { useRouter } from "next/router";

import { Box, Button, Container, Flex, Link, useColorModeValue } from "@chakra-ui/react";

import { configs } from "shared/content/Content";
import { ColorModeButton } from "shared/color-mode-button/ColorModeButton";
import { LogoType } from "shared/navbar/logo-type/LogoType";
import { bgDark, bgLight } from "theme";
import { RssIcon } from "utils/Icons";

interface Props {
    secondaryHref?: string;
    secondaryLabel?: string;
}

// Fixed top bar for the standalone blog pages, mirroring the resume page header.
export const BlogHeader: FC<Props> = ({ secondaryHref, secondaryLabel }) => {
    const router = useRouter();
    const bg = useColorModeValue(bgLight, bgDark);
    const color = useColorModeValue("gray.800", "white");

    return (
        <Box bg={bg} position="fixed" top="0" w="100%" left="50%" transform="translate(-50%)" zIndex="10">
            <Container py="4" px="4">
                <Flex justifyContent="space-between" alignItems="center">
                    <Box onClick={() => router.push("/")}>
                        <LogoType text={configs.common.logoType} />
                    </Box>
                    <Flex alignItems="center" gap={{ base: 3, md: 6 }}>
                        {secondaryHref && (
                            <Button variant="link" color={color} onClick={() => router.push(secondaryHref)}>
                                {secondaryLabel}
                            </Button>
                        )}
                        <Link
                            href="/rss.xml"
                            isExternal
                            aria-label="RSS feed"
                            color={color}
                            fontSize="lg"
                            display="inline-flex"
                            _hover={{ color: "primary.500" }}
                        >
                            <RssIcon />
                        </Link>
                        <ColorModeButton />
                    </Flex>
                </Flex>
            </Container>
        </Box>
    );
};
