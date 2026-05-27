import { FC, useEffect } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";

import { ChakraProvider } from "@chakra-ui/react";
import AOS from "aos";

import { theme } from "theme";

import "aos/dist/aos.css";
import "highlight.js/styles/github-dark.css";
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
                {/* Site-wide defaults. Per-page <Head> (e.g. BlogSeo) overrides any
                    tag sharing the same `key`. */}
                <title>Portfolio • Peter McKee</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="title" content="Portfolio • Peter McKee" key="title" />
                <meta name="description" content={description} key="description" />

                <meta property="og:type" content="website" key="og:type" />
                <meta property="og:url" content="https://petermckee.dev/" key="og:url" />
                <meta property="og:title" content="Portfolio • Peter McKee" key="og:title" />
                <meta property="og:description" content={description} key="og:description" />
                <meta property="og:image" content="https://petermckee.dev/logo.png" key="og:image" />

                <meta property="twitter:card" content="summary_large_image" key="twitter:card" />
                <meta property="twitter:url" content="https://petermckee.dev/" key="twitter:url" />
                <meta property="twitter:title" content="Portfolio • Peter McKee" key="twitter:title" />
                <meta property="twitter:description" content={description} key="twitter:description" />
                <meta property="twitter:image" content="https://petermckee.dev/logo.png" key="twitter:image" />

                <link rel="icon" href="/logo.png" />
                <link rel="manifest" href="/manifest.json" />
                <link rel="alternate" type="application/rss+xml" title="Peter McKee — Blog" href="/rss.xml" />
            </Head>
            <Component {...pageProps} />
        </ChakraProvider>
    );
};

export default App;
