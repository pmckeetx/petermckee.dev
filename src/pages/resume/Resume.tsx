import { FC } from "react";

import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    HStack,
    Link,
    ListItem,
    Stack,
    Text,
    UnorderedList,
    useColorModeValue,
} from "@chakra-ui/react";

import { configs } from "shared/content/Content";
import { Footer } from "shared/footer/Footer";
import { LogoType } from "shared/navbar/logo-type/LogoType";
import { ColorModeButton } from "shared/color-mode-button/ColorModeButton";
import { PageHeader } from "shared/page-header/PageHeader";
import { bgDark, bgLight } from "theme";
import { onResumeOpen } from "utils/Functions";
import { navigate } from "utils/router";
import { ArrowLeftIcon, DownloadIcon, GitHubIcon } from "utils/Icons";

interface Skill {
    category: string;
    items: string;
}

interface Job {
    company: string;
    role: string;
    duration: string;
    link?: string;
    highlights: string[];
}

interface Project {
    name: string;
    stack: string;
    description: string;
    highlights: string[];
}

const Highlights: FC<{ items: string[] }> = ({ items }) => (
    <UnorderedList spacing="2" pl="2" mt="4" styleType="'‣ '">
        {items.map((item, idx) => (
            <ListItem key={idx} pl="2" fontSize={{ base: "md", lg: "lg" }} lineHeight="1.6">
                {item}
            </ListItem>
        ))}
    </UnorderedList>
);

const ExperienceItem: FC<{ job: Job }> = ({ job }) => {
    const metaColor = useColorModeValue("gray.500", "gray.400");

    return (
        <Box py="8" borderTop="1px solid" borderColor={useColorModeValue("blackAlpha.200", "whiteAlpha.200")}>
            <Flex
                direction={{ base: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ base: "flex-start", md: "baseline" }}
                gap="1"
            >
                <Box>
                    <Heading fontSize={{ base: "2xl", md: "3xl" }} lineHeight="1.1">
                        {job.company}
                    </Heading>
                    <Text fontSize="lg" fontWeight="600" color="primary.500" mt="1">
                        {job.role}
                    </Text>
                </Box>
                <Text fontSize="sm" fontWeight="600" color={metaColor} whiteSpace="nowrap">
                    {job.duration}
                </Text>
            </Flex>

            <Highlights items={job.highlights} />

            {job.link && (
                <Link
                    href={job.link}
                    isExternal
                    mt="4"
                    color="primary.500"
                    fontWeight="600"
                    fontSize="sm"
                    display="inline-flex"
                    alignItems="center"
                    gap="2"
                    _hover={{ textDecoration: "none", color: "primary.600" }}
                >
                    <GitHubIcon />
                    <Box as="span">View on GitHub</Box>
                </Link>
            )}
        </Box>
    );
};

const ProjectItem: FC<{ project: Project }> = ({ project }) => {
    const metaColor = useColorModeValue("gray.500", "gray.400");

    return (
        <Box py="8" borderTop="1px solid" borderColor={useColorModeValue("blackAlpha.200", "whiteAlpha.200")}>
            <Heading fontSize={{ base: "2xl", md: "3xl" }} lineHeight="1.2">
                {project.name}
            </Heading>
            <Text fontSize="sm" fontWeight="600" color={metaColor} mt="2">
                {project.stack}
            </Text>
            <Text fontSize={{ base: "md", lg: "lg" }} fontStyle="italic" mt="4" lineHeight="1.6">
                {project.description}
            </Text>
            <Highlights items={project.highlights} />
        </Box>
    );
};

export const Resume: FC = () => {
    const bg = useColorModeValue(bgLight, bgDark);
    const metaColor = useColorModeValue("gray.500", "gray.400");
    const { name, title, location, email, summary, skills, experience, projects } = configs.resume;

    return (
        <Box>
            <Box bg={bg} position="fixed" top="0" w="100%" left="50%" transform="translate(-50%)" zIndex="10">
                <Container py="4" px="4">
                    <Flex justifyContent="space-between" alignItems="center">
                        <Box onClick={() => navigate("/")}>
                            <LogoType text={configs.common.logoType} />
                        </Box>
                        <Flex alignItems="center" gap={{ base: 3, md: 6 }}>
                            <Button
                                variant="link"
                                color={useColorModeValue("gray.800", "white")}
                                leftIcon={<ArrowLeftIcon />}
                                onClick={() => navigate("/")}
                            >
                                <Box as="span" display={{ base: "none", sm: "inline" }}>
                                    Back to site
                                </Box>
                            </Button>
                            <Button size="sm" borderRadius="lg" leftIcon={<DownloadIcon />} onClick={onResumeOpen}>
                                <Box as="span" display={{ base: "none", sm: "inline" }}>
                                    Download PDF
                                </Box>
                                <Box as="span" display={{ base: "inline", sm: "none" }}>
                                    PDF
                                </Box>
                            </Button>
                            <ColorModeButton />
                        </Flex>
                    </Flex>
                </Container>
            </Box>

            <Container h="100%" px={{ base: 6, md: 6, lg: 4 }}>
                <Box pt={{ base: "112px", md: "128px" }} pb="16">
                    <Heading fontSize={{ base: "5xl", md: "7xl" }} lineHeight="1">
                        {name}
                    </Heading>
                    <Text fontSize={{ base: "lg", md: "xl" }} color="primary.500" fontWeight="600" mt="3">
                        {title}
                    </Text>
                    <HStack spacing="2" mt="2" color={metaColor} fontSize="md" fontWeight="600">
                        <Text>{location}</Text>
                        <Text>•</Text>
                        <Link href={`mailto:${email}`} _hover={{ color: "primary.500" }}>
                            {email}
                        </Link>
                    </HStack>

                    <PageHeader label="Summary" />
                    <Text fontSize={{ base: "lg", md: "xl" }} lineHeight="1.7">
                        {summary}
                    </Text>

                    <PageHeader label="Technical Skills" />
                    <Stack spacing="4">
                        {(skills as Skill[]).map((skill) => (
                            <Flex
                                key={skill.category}
                                direction={{ base: "column", md: "row" }}
                                gap={{ base: "1", md: "6" }}
                            >
                                <Text
                                    flexShrink={0}
                                    w={{ base: "auto", md: "14rem" }}
                                    fontWeight="700"
                                    color="primary.500"
                                >
                                    {skill.category}
                                </Text>
                                <Text flex="1" fontWeight="500">
                                    {skill.items}
                                </Text>
                            </Flex>
                        ))}
                    </Stack>

                    <PageHeader label="Experience" />
                    <Box>
                        {(experience as Job[]).map((job, idx) => (
                            <ExperienceItem key={`${job.company}-${idx}`} job={job} />
                        ))}
                    </Box>

                    <PageHeader label="Selected Projects" />
                    <Box>
                        {(projects as Project[]).map((project) => (
                            <ProjectItem key={project.name} project={project} />
                        ))}
                    </Box>
                </Box>
                <Footer />
            </Container>
        </Box>
    );
};
