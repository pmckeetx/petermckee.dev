import { FC } from "react";

import { Box, Flex, Heading, Text, useColorModeValue } from "@chakra-ui/react";

import { open } from "utils/Functions";

interface Props {
    id: string;
    outlet: string;
    quote: string;
    link?: string;
    context?: string;
    delay?: number;
}

export const PressQuoteCard: FC<Props> = ({ id, outlet, quote, link, context, delay = 0 }) => {
    const bg = useColorModeValue("blackAlpha.50", "whiteAlpha.50");
    const quoteColor = useColorModeValue("gray.800", "gray.50");
    const contextColor = useColorModeValue("gray.500", "gray.400");

    const onClick = () => {
        if (link) open(link);
    };

    return (
        <Flex
            id={`press-quote-${id}`}
            data-aos="fade-up"
            data-aos-delay={delay}
            direction="column"
            justifyContent="space-between"
            bg={bg}
            borderLeft="3px solid"
            borderLeftColor="primary.500"
            borderRadius="md"
            p={{ base: "5", md: "6" }}
            transition="0.2s ease-in-out"
            transitionProperty="transform, box-shadow"
            cursor={link ? "pointer" : "default"}
            _hover={
                link
                    ? {
                          transform: "translateY(-2px)",
                          shadow: "lg",
                      }
                    : {}
            }
            onClick={onClick}
            h="100%"
        >
            <Box>
                <Text as="span" color="primary.500" fontFamily="heading" fontWeight="700" fontSize="3xl" lineHeight="1">
                    &ldquo;
                </Text>
                <Heading
                    as="blockquote"
                    fontStyle="italic"
                    fontWeight="500"
                    fontSize={{ base: "lg", md: "xl" }}
                    lineHeight="1.4"
                    color={quoteColor}
                    mt="-2"
                >
                    {quote}
                </Heading>
            </Box>
            <Box mt="6">
                <Text
                    fontFamily="heading"
                    textTransform="uppercase"
                    letterSpacing="0.15em"
                    fontWeight="700"
                    fontSize="sm"
                    color="primary.500"
                >
                    {outlet}
                </Text>
                {context && (
                    <Text fontSize="xs" color={contextColor} mt="1">
                        {context}
                    </Text>
                )}
            </Box>
        </Flex>
    );
};
