import { FC, ReactNode } from "react";

import { Box, Container, Link } from "@chakra-ui/react";

import { Footer } from "shared/footer/Footer";
import { SiteHeader } from "shared/site-header/SiteHeader";
import { RssIcon } from "utils/Icons";

interface Props {
    children: ReactNode;
}

const RssLink: FC = () => (
    <Link
        href="/rss.xml"
        isExternal
        aria-label="RSS feed"
        title="RSS feed"
        color="gray.300"
        fontSize="lg"
        display="inline-flex"
        _hover={{ color: "primary.500" }}
    >
        <RssIcon />
    </Link>
);

// Shared chrome for the blog and publications routes: the site header, a content container and the footer.
export const BlogLayout: FC<Props> = ({ children }) => (
    <Box>
        <SiteHeader actions={<RssLink />} />
        <Container h="100%" px={{ base: 6, md: 6, lg: 4 }}>
            <Box pt={{ base: "112px", md: "128px" }} pb="16">
                {children}
            </Box>
            <Footer />
        </Container>
    </Box>
);
