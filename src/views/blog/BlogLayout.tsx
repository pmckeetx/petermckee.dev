import { FC, ReactNode } from "react";

import { Box, Container } from "@chakra-ui/react";

import { Footer } from "shared/footer/Footer";
import { BlogHeader } from "views/blog/BlogHeader";

interface Props {
    children: ReactNode;
    secondaryHref?: string;
    secondaryLabel?: string;
}

// Shared chrome for every blog route: fixed header + content container + footer.
export const BlogLayout: FC<Props> = ({ children, secondaryHref, secondaryLabel }) => (
    <Box>
        <BlogHeader secondaryHref={secondaryHref} secondaryLabel={secondaryLabel} />
        <Container h="100%" px={{ base: 6, md: 6, lg: 4 }}>
            <Box pt={{ base: "112px", md: "128px" }} pb="16">
                {children}
            </Box>
            <Footer />
        </Container>
    </Box>
);
