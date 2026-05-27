import { FC } from "react";

import { Box, Text } from "@chakra-ui/react";

interface Props {
    text: {
        mobile: string;
        desktop: string;
    };
}

export const LogoType: FC<Props> = ({ text }) => {
    // Render both variants and toggle with CSS so server and client markup match
    // (a JS breakpoint switch via useBreakpointValue would cause a hydration mismatch).
    return (
        <Box transition="all 0.2s ease-in-out" _hover={{ cursor: "pointer", color: "primary.600" }}>
            <Text fontSize={{ base: "3xl", md: "4xl" }} lineHeight="1" fontFamily="Signature" mb={{ base: 0, md: -2 }}>
                <Box as="span" display={{ base: "inline", md: "none" }}>
                    {text.mobile}
                </Box>
                <Box as="span" display={{ base: "none", md: "inline" }}>
                    {text.desktop}
                </Box>
            </Text>
        </Box>
    );
};
