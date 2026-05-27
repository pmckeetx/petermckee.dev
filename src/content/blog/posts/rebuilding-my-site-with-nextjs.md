---
title: "Rebuilding This Site with Next.js"
date: "2026-04-08"
tags: ["Next.js", "TypeScript", "Web"]
author: "peter"
excerpt: "I moved petermckee.dev from a hand-rolled CRA single-page app to Next.js. Here's what got simpler and what I'd do again."
hero: "/assets/HP.jpeg"
heroAlt: "The petermckee.dev homepage"
featured: false
draft: false
---

This site started life as a Create React App single-page app with a tiny custom
router. It worked, but as soon as I wanted real pages — a resume route, and now a
blog — I kept reinventing things the framework should just give me.

So I migrated to **Next.js**. Here's the short version of what changed.

## Routing stopped being my problem

The old setup tracked `window.location.pathname` and branched in a top-level
component. Every new page meant another branch and another lazy import.

With file-based routing, a new page is just a file:

```tsx
// src/pages/blog/[slug].tsx
export default function PostPage({ post }) {
    return <BlogPost post={post} />;
}
```

No router config, no manual code-splitting.

## SEO came for free

The biggest win was static generation. Each page is prerendered to HTML at build
time, so the `<title>`, description, and Open Graph tags are in the initial
response — which means link previews actually work when I share a post.

I used to think I'd need a separate prerendering tool bolted onto the SPA. With
Next.js, `getStaticProps` does it.

## What I kept

- **Chakra UI** for the component layer and color mode.
- The same content model — Markdown files plus small JSON configs.
- `react-markdown` for rendering prose.

Migrations are rarely as clean as the blog post makes them sound, but this one
genuinely removed more code than it added.
