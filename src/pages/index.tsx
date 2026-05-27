import type { NextPage } from "next";

import { Box, Container } from "@chakra-ui/react";

import { NavbarHeight } from "theme";
import { AboutPageId, SpeakingPageId, WorkPageId } from "utils/useScroll";

import { Navbar } from "shared/navbar/Navbar";
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
            <Navbar />

            <Box mt={{ base: "96px", md: NavbarHeight }}>
                <Landing />
                <Box id={SpeakingPageId}>
                    <PageHeader label="Press" />
                    <SpeakingPress />
                </Box>

                <Box id={WorkPageId}>
                    <PageHeader label="Featured Projects" />
                    <FeaturedProjects />

                    <PageHeader id="page-other-projects" label="Other Projects" />
                    <OtherProjects />
                </Box>

                <SpeakingMedia />

                <Box id={AboutPageId}>
                    <PageHeader label="About Me" />
                    <About />
                </Box>
            </Box>
            <Footer />
        </Container>
    );
};

export default Home;
