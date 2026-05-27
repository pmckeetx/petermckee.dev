// Shared blog types. Kept free of `fs`/Node imports so client components can
// import them without pulling the server-only data layer (src/lib/blog.ts)
// into the browser bundle.

export interface Social {
    type: string;
    link: string;
}

export interface Author {
    id: string;
    name: string;
    bio: string;
    headshot: string;
    socials: Social[];
}

export interface PostMeta {
    slug: string;
    title: string;
    date: string; // ISO (YYYY-MM-DD)
    tags: string[];
    author: string; // Author id
    excerpt: string;
    hero: string | null;
    heroAlt: string | null;
    featured: boolean;
    draft: boolean;
    readingTime: string; // e.g. "5 min read"
}

export interface Post {
    meta: PostMeta;
    body: string; // markdown body (frontmatter stripped)
}
