import { FC } from "react";

import { Button, Flex, IconButton } from "@chakra-ui/react";

import { ArrowRightIcon, GitHubIcon, LinkIcon } from "utils/Icons";
import { open } from "utils/Functions";

interface GitHubButtonProps {
    github?: string;
}

interface ReadMoreProps {
    readMore?: string;
}

interface LiveDemoProps {
    demo?: string;
}

// Below `lg` these render as icon-only buttons, at `lg`+ as labelled buttons.
// Both variants are always rendered and toggled with CSS `display` so the
// server and client markup stay identical (avoids a hydration mismatch that a
// useBreakpointValue component switch would introduce).
const mobileOnly = { base: "inline-flex", lg: "none" } as const;
const desktopOnly = { base: "none", lg: "inline-flex" } as const;

interface Props extends GitHubButtonProps, ReadMoreProps, LiveDemoProps {}

export const ReadMore: FC<ReadMoreProps> = ({ readMore }) => {
    return readMore ? (
        <Button
            data-aos="fade"
            data-aos-offset="200"
            variant="link"
            colorScheme="black"
            rightIcon={<ArrowRightIcon fontSize="16pt" />}
            onClick={() => open(readMore)}
        >
            Read More
        </Button>
    ) : null;
};

export const GitHubButton: FC<GitHubButtonProps> = ({ github }) => {
    if (!github) return null;

    return (
        <>
            <IconButton
                data-aos="fade"
                data-aos-delay="400"
                aria-label="GitHub"
                variant="secondary"
                py="5"
                display={mobileOnly}
                icon={<GitHubIcon />}
                onClick={() => open(github)}
            />
            <Button
                data-aos="fade"
                data-aos-delay="400"
                variant="secondary"
                py="5"
                display={desktopOnly}
                leftIcon={<GitHubIcon />}
                onClick={() => open(github)}
            >
                GitHub
            </Button>
        </>
    );
};

export const LiveDemo: FC<LiveDemoProps> = ({ demo }) => {
    if (!demo) return null;

    return (
        <>
            <IconButton
                data-aos="fade"
                data-aos-delay="200"
                aria-label="Live Demo"
                display={mobileOnly}
                icon={<LinkIcon fontSize="14pt" />}
                onClick={() => open(demo)}
            />
            <Button
                data-aos="fade"
                data-aos-delay="200"
                display={desktopOnly}
                leftIcon={<LinkIcon fontSize="14pt" />}
                onClick={() => open(demo)}
            >
                Live Demo
            </Button>
        </>
    );
};

export const ProjectCardFooter: FC<Props> = ({ readMore, github, demo }) => {
    return (
        <Flex justifyContent={readMore ? "space-between" : "flex-end"} alignItems="center" pt="8">
            <ReadMore readMore={readMore} />
            <Flex gap="4" justifyContent="space-between" alignItems="center" display={demo || github ? "flex" : "none"}>
                <LiveDemo demo={demo} />
                <GitHubButton github={github} />
            </Flex>
        </Flex>
    );
};
