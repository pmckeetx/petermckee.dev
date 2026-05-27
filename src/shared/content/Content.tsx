import { FC } from "react";

import { Text, Stack, StyleProps, Link, UnorderedList } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";

import common from "content/common/common.json";
import landing from "content/landing/landing-config.json";
import featuredProjects from "content/featured-projects/featured-projects-config.json";
import otherProjects from "content/other-projects/other-projects-config.json";
import about from "content/about/about-config.json";
import speaking from "content/speaking/speaking-config.json";
import resume from "content/resume/resume-config.json";

import LandingMd from "content/landing/landing.md";
import AboutMd from "content/about/about.md";

export const configs = {
    common,
    landing,
    featuredProjects,
    otherProjects,
    about,
    speaking,
    resume,
};

interface State {
    landing: string;
    about: string;
}

export enum MarkdownFile {
    Landing = "landing",
    About = "about",
}

const Mapper = {
    [MarkdownFile.Landing]: LandingMd,
    [MarkdownFile.About]: AboutMd,
};

export const useContent = (fileName: MarkdownFile): State => {
    // The .md files are imported as raw strings (see next.config.js), so the
    // content is available synchronously at render time.
    return { landing: "", about: "", [fileName]: Mapper[fileName] };
};

interface Props extends StyleProps {
    children?: string;
}

export const Content: FC<Props> = ({ children, ...rest }) => {
    return (
        <Stack spacing="4">
            <ReactMarkdown
                components={{
                    p: ({ node, ...props }) => <Text {...rest} {...props} />,
                    a: ({ node, ...props }) => (
                        <Link href={props.href} target="_blank" color="primary.200" {...props} />
                    ),
                    ul: ({ node, ...props }) => {
                        const { ordered, ...rest } = props;

                        return (
                            <UnorderedList
                                {...rest}
                                data-aos="fade"
                                listStylePosition="inside"
                                display="grid"
                                gridTemplateColumns="repeat(2, 1fr)"
                                listStyleType="'‣ '"
                                fontWeight="600"
                            />
                        );
                    },
                    li: ({ node, ...props }) => {
                        const { ordered, ...rest } = props;

                        return <li data-aos="flip-up" data-aos-delay={props.index * 100 + 400} {...rest} />;
                    },
                }}
            >
                {children as string}
            </ReactMarkdown>
        </Stack>
    );
};
