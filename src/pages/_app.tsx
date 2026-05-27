import { FC, useEffect } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";

import { ChakraProvider } from "@chakra-ui/react";
import AOS from "aos";

import { theme } from "theme";

import "aos/dist/aos.css";
import "../index.scss";
import "../App.scss";

const description =
    "Peter McKee — hands-on technical leader architecting and shipping production AI systems, with three decades of engineering experience across IC, architect, and director-level roles at Docker, JFrog, AssemblyAI, and Sonar.";

const App: FC<AppProps> = ({ Component, pageProps }) => {
    useEffect(() => {
        AOS.init({ once: true });
    }, []);

    return (
        <ChakraProvider theme={theme}>
            <Head>
                <title>Portfolio • Peter McKee</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="title" content="Portfolio • Peter McKee" />
                <meta name="description" content={description} />

                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://petermckee.dev/" />
                <meta property="og:title" content="Portfolio • Peter McKee" />
                <meta property="og:description" content={description} />
                <meta property="og:image" content="https://petermckee.dev/logo.png" />

                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://petermckee.dev/" />
                <meta property="twitter:title" content="Portfolio • Peter McKee" />
                <meta property="twitter:description" content={description} />
                <meta property="twitter:image" content="https://petermckee.dev/logo.png" />

                <link rel="icon" href="/logo.png" />
                <link rel="manifest" href="/manifest.json" />
            </Head>
            <Component {...pageProps} />
        </ChakraProvider>
    );
};

export default App;
