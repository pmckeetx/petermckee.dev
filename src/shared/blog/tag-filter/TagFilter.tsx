import { FC } from "react";

import { Badge, Flex } from "@chakra-ui/react";

interface Props {
    tags: string[];
    /** Currently active tag, or null for "All". */
    selected: string | null;
    onSelect: (tag: string | null) => void;
}

const TagBadge: FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <Badge
        as="button"
        type="button"
        onClick={onClick}
        cursor="pointer"
        textTransform="none"
        borderRadius="md"
        px="10px"
        py="5px"
        fontSize="sm"
        fontWeight="600"
        transition="0.2s ease-in-out"
        transitionProperty="background, color"
        colorScheme={active ? "primary" : "gray"}
        bg={active ? "primary.500" : undefined}
        color={active ? "white" : undefined}
        _hover={{ color: "white", bg: "primary.500" }}
    >
        {label}
    </Badge>
);

export const TagFilter: FC<Props> = ({ tags, selected, onSelect }) => {
    return (
        <Flex wrap="wrap" gap="3" align="center">
            <TagBadge label="All" active={selected === null} onClick={() => onSelect(null)} />
            {tags.map((tag) => (
                <TagBadge
                    key={tag}
                    label={tag}
                    active={selected?.toLowerCase() === tag.toLowerCase()}
                    onClick={() => onSelect(tag)}
                />
            ))}
        </Flex>
    );
};
