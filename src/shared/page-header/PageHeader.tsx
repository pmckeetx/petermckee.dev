import { FC } from "react";

import { Box, Text } from "@chakra-ui/react";

interface Props {
    id?: string;
    label: string;
    /** Less space above and below, for pages with many sections (the blog). */
    compact?: boolean;
}
export const PageHeader: FC<Props> = ({ id, label, compact = false }) => {
    const borderColor = "gray.500";

    return (
        <Box
            id={id}
            pt={compact ? { base: "14", md: "16" } : { base: "24", md: "32" }}
            pb={compact ? "8" : "16"}
            _before={{
                display: "inline-block",
                content: "''",
                borderBottom: "2px solid ",
                borderColor,
                width: "5rem",
                margin: "auto",
                marginRight: "0.5rem",
                transform: "translateY(-0.35rem)",
            }}
            textTransform="uppercase"
            fontSize="xl"
        >
            <Text as="span" color={borderColor} fontWeight="700">
                {label}
            </Text>
        </Box>
    );
};
