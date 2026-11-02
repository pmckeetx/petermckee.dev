import { FC, ReactNode, useRef } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";

import {
    Box,
    Container,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Flex,
    HStack,
    IconButton,
    Link,
    VStack,
    useDisclosure,
} from "@chakra-ui/react";

import { configs } from "shared/content/Content";
import { LogoType } from "shared/navbar/logo-type/LogoType";
import { Socials } from "shared/socials/Socials";
import { bgDark } from "theme";
import { MenuIcon } from "utils/Icons";
import { AboutPageId, useScroll, WorkPageId } from "utils/useScroll";

// Every page of the site uses this header, so the same five destinations are one click away
// from anywhere. Work and About are sections of the home page: on the home page they scroll,
// everywhere else they navigate to "/#section".
export const NAV_ITEMS = [
    { label: "Work", href: `/#${WorkPageId}`, section: WorkPageId },
    { label: "Publications", href: "/publications" },
    { label: "About", href: `/#${AboutPageId}`, section: AboutPageId },
    { label: "Blog", href: "/blog" },
    { label: "Resume", href: "/resume" },
] as const;

type NavItem = (typeof NAV_ITEMS)[number];

const useActive = () => {
    const { pathname } = useRouter();
    const section = useScroll();

    return (item: NavItem) => {
        if ("section" in item) return pathname === "/" && section === item.section;
        return pathname === item.href || pathname.startsWith(`${item.href}/`);
    };
};

const NavLink: FC<{ item: NavItem; active: boolean; onNavigate?: () => void; size?: "md" | "lg" }> = ({
    item,
    active,
    onNavigate,
    size = "md",
}) => {
    const { pathname } = useRouter();

    const onClick = (event: React.MouseEvent) => {
        onNavigate?.();
        // Already on the home page: scroll to the section instead of a route change.
        if ("section" in item && pathname === "/") {
            event.preventDefault();
            const target = document.getElementById(item.section);
            setTimeout(() => target?.scrollIntoView({ behavior: "smooth" }), onNavigate ? 250 : 0);
            history.replaceState(null, "", item.href);
        }
    };

    return (
        <Link
            as={NextLink}
            href={item.href}
            onClick={onClick}
            aria-current={active ? "page" : undefined}
            color={active ? "white" : "gray.300"}
            fontWeight="700"
            fontSize={size === "lg" ? "2xl" : "md"}
            textDecoration="underline"
            textDecorationThickness="2px"
            textUnderlineOffset="6px"
            textDecorationColor={active ? "primary.500" : "transparent"}
            transition="color 0.2s, text-decoration-color 0.2s"
            _hover={{ color: "white", textDecorationColor: active ? "primary.500" : "gray.500" }}
        >
            {item.label}
        </Link>
    );
};

interface Props {
    /** Page-specific controls shown at the right of the bar, after the menu: an RSS link, a PDF button. */
    actions?: ReactNode;
}

export const SiteHeader: FC<Props> = ({ actions }) => {
    const isActive = useActive();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const menuButton = useRef<HTMLButtonElement>(null);

    return (
        <Box
            as="header"
            bg={bgDark}
            position="fixed"
            top="0"
            left="0"
            right="0"
            zIndex="10"
            borderBottom="1px solid"
            borderColor="whiteAlpha.100"
        >
            <Container py="4" px={{ base: 6, lg: 4 }}>
                <Flex justifyContent="space-between" alignItems="center" gap="6">
                    <Link as={NextLink} href="/" aria-label="Home" color="inherit" _hover={{ textDecoration: "none" }}>
                        <LogoType text={configs.common.logoType} />
                    </Link>

                    <Flex alignItems="center" gap={{ base: 3, md: 8 }}>
                        <HStack as="nav" aria-label="Main" spacing="8" display={{ base: "none", md: "flex" }}>
                            {NAV_ITEMS.map((item) => (
                                <NavLink key={item.label} item={item} active={isActive(item)} />
                            ))}
                        </HStack>
                        {actions}
                        <IconButton
                            ref={menuButton}
                            aria-label="Open menu"
                            icon={<MenuIcon />}
                            variant="icon"
                            color="primary.500"
                            fontSize="xl"
                            minW="auto"
                            display={{ base: "inline-flex", md: "none" }}
                            onClick={onOpen}
                        />
                    </Flex>
                </Flex>
            </Container>

            <Drawer isOpen={isOpen} placement="right" onClose={onClose} finalFocusRef={menuButton}>
                <DrawerOverlay />
                <DrawerContent bg={bgDark}>
                    <DrawerHeader px="4">
                        <Flex justifyContent="flex-end">
                            <DrawerCloseButton position="relative" top="0" right="0" />
                        </Flex>
                    </DrawerHeader>
                    <DrawerBody>
                        <VStack as="nav" aria-label="Main" spacing="6" my="16">
                            {NAV_ITEMS.map((item) => (
                                <NavLink
                                    key={item.label}
                                    item={item}
                                    active={isActive(item)}
                                    onNavigate={onClose}
                                    size="lg"
                                />
                            ))}
                        </VStack>
                        <Flex justifyContent="center" mt="16">
                            <Socials delay={100} resume={false} />
                        </Flex>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    );
};
