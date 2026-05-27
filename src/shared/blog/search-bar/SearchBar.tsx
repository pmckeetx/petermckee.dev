import { FC } from "react";

import { Input, InputGroup, InputLeftElement, useColorModeValue } from "@chakra-ui/react";

import { SearchIcon } from "utils/Icons";

interface Props {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const SearchBar: FC<Props> = ({ value, onChange, placeholder = "Search articles…" }) => {
    const borderColor = useColorModeValue("blackAlpha.300", "whiteAlpha.300");

    return (
        <InputGroup maxW={{ base: "100%", md: "20rem" }}>
            <InputLeftElement pointerEvents="none" color="gray.500">
                <SearchIcon />
            </InputLeftElement>
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                aria-label="Search articles"
                borderRadius="lg"
                borderColor={borderColor}
                _focus={{ borderColor: "primary.500", boxShadow: "none" }}
            />
        </InputGroup>
    );
};
