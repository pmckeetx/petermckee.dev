import { FC, ReactNode } from "react";

import { Alert, AlertIcon, Box, Text } from "@chakra-ui/react";

// A note, tip or warning in a blog post, from `> [!NOTE]`-style Markdown (see remarkCallouts). Rendered as a
// <blockquote> so the post's structure stays one element per Markdown block.

const STATUS = { note: "info", tip: "success", warning: "warning" } as const;

interface Props {
    type: string;
    title: string;
    children?: ReactNode;
    [attr: string]: unknown;
}

export const Callout: FC<Props> = ({ type, title, children, ...rest }) => (
    <Alert
        as="blockquote"
        role="note"
        status={STATUS[type as keyof typeof STATUS] ?? "info"}
        variant="left-accent"
        alignItems="flex-start"
        borderRadius="md"
        my="6"
        py="4"
        {...rest}
    >
        <AlertIcon mt="1" />
        <Box sx={{ "& p": { my: 1, lineHeight: "1.7" } }}>
            <Text as="span" display="block" fontWeight="700" data-callout-heading="">
                {title}
            </Text>
            {children}
        </Box>
    </Alert>
);
