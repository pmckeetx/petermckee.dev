import { FC } from "react";

import { Box, SimpleGrid } from "@chakra-ui/react";

import { PageHeader } from "shared/page-header/PageHeader";
import { configs } from "shared/content/Content";
import { PressQuoteCard } from "pages/speaking/PressQuoteCard";
import { HighlightCard } from "pages/speaking/HighlightCard";

export const SpeakingPress: FC = () => {
    const { press } = configs.speaking;

    return (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="6">
            {press.map((item, idx) => (
                <PressQuoteCard key={item.id} delay={idx * 100} {...item} />
            ))}
        </SimpleGrid>
    );
};

export const SpeakingMedia: FC = () => {
    const { media, writing } = configs.speaking;

    return (
        <Box>
            <PageHeader label="Speaking & Media" />
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="6">
                {media.map((item, idx) => (
                    <HighlightCard key={item.id} delay={(idx % 2) * 100} {...item} />
                ))}
            </SimpleGrid>

            <PageHeader label="Writing" />
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="6">
                {writing.map((item, idx) => (
                    <HighlightCard key={item.id} delay={(idx % 2) * 100} {...item} />
                ))}
            </SimpleGrid>
        </Box>
    );
};
