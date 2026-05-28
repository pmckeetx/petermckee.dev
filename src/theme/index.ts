import { ThemeConfig, extendTheme, withDefaultColorScheme } from "@chakra-ui/react";

import { PrimaryColors, PrimaryDarkColors } from "theme/colors/Colors";
import { components } from "theme/component-styles/ComponentStyles";

// Site is dark-mode-only. `initialColorMode` is the value the ColorModeScript
// inlines pre-hydration to avoid a flash; the runtime mode itself is forced to
// "dark" by the colorModeManager passed to ChakraProvider in _app.tsx.
const config: ThemeConfig = {
    cssVarPrefix: "hp",
    initialColorMode: "dark",
    useSystemColorMode: false,
};

const fonts = {
    body: "'Urbanist', sans-serif",
    heading: "'Playfair Display', serif;",
};

const colors = {
    primary: {
        ...PrimaryColors,
    },
    gray: {
        ...PrimaryDarkColors,
    },
};

export const bgLight = "white";
export const bgDark = "gray.800";
export const NavbarHeight = "144px";

export const theme = extendTheme(
    {
        config,
        colors,
        fonts,
        components,
    },
    withDefaultColorScheme({ colorScheme: "primary" }),
);
