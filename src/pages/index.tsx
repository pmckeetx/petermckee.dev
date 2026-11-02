import type { NextPage } from "next";

import { Box, Container } from "@chakra-ui/react";

import { NavbarHeight } from "theme";
import { AboutPageId, SpeakingPageId, WorkPageId } from "utils/useScroll";

import { SiteHeader } from "shared/site-header/SiteHeader";
import { Footer } from "shared/footer/Footer";
import { PageHeader } from "shared/page-header/PageHeader";
import { Landing } from "views/landing/Landing";
import { FeaturedProjects } from "views/featured-projects/FeaturedProjects";
import { OtherProjects } from "views/other-projects/OtherProjects";
import { SpeakingPress, SpeakingMedia } from "views/speaking/Speaking";
import { About } from "views/about/About";

const Home: NextPage = () => {
    return (
        <Container h="100%" px={{ base: 6, md: 6, lg: 4 }}>
            <SiteHeader />

            <Box mt={{ base: "96px", md: NavbarHeight }}>
                <Landing />
                <Box id={SpeakingPageId} scrollMarginTop="80px">
                    <PageHeader label="Press" />
                    <SpeakingPress />
                </Box>

                <Box id={WorkPageId} scrollMarginTop="80px">
                    <PageHeader label="Featured Projects" />
                    <FeaturedProjects />
                </Box>

                <SpeakingMedia />

                <Box id={AboutPageId} scrollMarginTop="80px">
                    <PageHeader label="About Me" />
                    <About />
                </Box>
            </Box>
            <Footer />
        </Container>
    );
};

export default Home;
