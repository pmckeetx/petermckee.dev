import { FC } from "react";
import Head from "next/head";

import { absoluteUrl } from "lib/format";

interface Props {
    title: string;
    description: string;
    /** Site-relative path, e.g. "/blog/my-post". */
    path: string;
    image?: string | null;
    type?: "website" | "article";
    publishedTime?: string;
}

const DEFAULT_IMAGE = "/logo.png";

// Per-page <head> tags for blog routes. Because pages are statically generated,
// these end up in the prerendered HTML, so crawlers and link unfurlers see them.
export const BlogSeo: FC<Props> = ({ title, description, path, image, type = "article", publishedTime }) => {
    const url = absoluteUrl(path);
    const ogImage = absoluteUrl(image ?? DEFAULT_IMAGE);

    return (
        <Head>
            {/* Keys match the site-wide tags in _app.tsx so these override them. */}
            <title>{title}</title>
            <meta name="title" content={title} key="title" />
            <meta name="description" content={description} key="description" />
            <link rel="canonical" href={url} key="canonical" />

            <meta property="og:type" content={type} key="og:type" />
            <meta property="og:url" content={url} key="og:url" />
            <meta property="og:title" content={title} key="og:title" />
            <meta property="og:description" content={description} key="og:description" />
            <meta property="og:image" content={ogImage} key="og:image" />
            {type === "article" && publishedTime && (
                <meta property="article:published_time" content={publishedTime} key="article:published_time" />
            )}

            <meta property="twitter:card" content="summary_large_image" key="twitter:card" />
            <meta property="twitter:url" content={url} key="twitter:url" />
            <meta property="twitter:title" content={title} key="twitter:title" />
            <meta property="twitter:description" content={description} key="twitter:description" />
            <meta property="twitter:image" content={ogImage} key="twitter:image" />
        </Head>
    );
};
