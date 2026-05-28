# Peter McKee

> Hands-on technical leader architecting and shipping production AI systems — autonomous agent platforms, multi-tenant voice AI with RAG, and provider-agnostic LLM tooling. Three decades of engineering across IC, architect, and director-level roles at Docker, JFrog, AssemblyAI, and Sonar.

🌐 **[petermckee.dev](https://petermckee.dev)**  •  ✉️ [hello@petermckee.dev](mailto:hello@petermckee.dev)  •  💻 [github.com/pmckeetx](https://github.com/pmckeetx)

---

## Hello 👋

I'm a hands-on technical leader based out of Round Rock, Texas with three decades of engineering experience spanning IC, architect, and director-level roles at [Docker](https://www.docker.com/), [JFrog](https://jfrog.com/), [AssemblyAI](https://www.assemblyai.com/), and [Sonar](https://www.sonarsource.com/).

These days I architect and ship production AI systems through my consultancy **Ronin AI** — autonomous agent platforms, multi-tenant voice AI with RAG, and provider-agnostic LLM tooling. I combine engineering depth with clear technical direction and a strong bias for building.

When I'm not heads-down in Rust or TypeScript, you'll find me hacking on [ShrikeDB](https://github.com/shrikedb/shrikedb), my open-source Redis-compatible in-memory database written in Rust.

### What I'm working with right now

- **Rust** + Tokio
- **TypeScript** / Next.js
- Anthropic, OpenAI, Ollama
- PostgreSQL + pgvector
- VAPI
- Node.js

---

## Featured projects

### [ShrikeDB](https://github.com/shrikedb/shrikedb) — *Feb 2026 → present, open source*

A Redis-compatible in-memory database in Rust implementing ~95 commands across 6 data-type families over the RESP wire protocol. Designed around a shared-nothing, multi-shard execution model with a Dash-style extendible hash table that avoids stop-the-world rehashes and keeps tail latency flat under load.

`Rust` · `Tokio` · `Redis/RESP` · `Systems` · `Concurrency`

### Voice Assistant — *2025, Ronin AI*

A multi-tenant SaaS platform that lets businesses stand up an AI phone receptionist on their own VAPI account in minutes — answering inbound calls, booking appointments against the company's live calendar, and grounding responses in a per-tenant knowledge base with chunked ingestion and pgvector embeddings.

`Next.js 16` · `TypeScript` · `Prisma` · `Postgres` · `NextAuth v5` · `VAPI` · `Google Calendar` · `Microsoft Graph` · `pgvector`

### Multi-Surface Agent Platform — *2025, Ronin AI*

A full-stack autonomous AI agent platform built as a Node.js monorepo (CLI + Next.js web dashboard + reusable core), with a provider-agnostic adapter layer for Anthropic, OpenAI, and Ollama, plus a tool registry, planner, context manager, and Redis-backed memory for long-running, tool-using agent jobs.

`Node.js` · `Next.js 16` · `React 19` · `TypeScript` · `Anthropic` · `OpenAI` · `Ollama` · `Puppeteer` · `Lightpanda` · `Tavily` · `Redis`

### AI Agent Framework — *2025, Ronin AI*

A modular Node.js framework for autonomous planning agents that decompose a goal, generate a plan, execute via tools, evaluate results, and replan — built spec-first across a 6-module architecture with explicit dependency rules, JSON-Schema-validated tool I/O, and human-approval gating.

`Node.js` · `JSDoc` · `Anthropic SDK` · `Commander` · `Vitest` · `pnpm`

---

## Experience

| When | Role | Company |
|---|---|---|
| Jan 2025 → present | Lead Developer, Technical Delivery | **Ronin AI** |
| Aug 2024 – Dec 2024 | Global Head of Community, DevRel, DX | **AssemblyAI** |
| Jan 2023 – Aug 2024 | VP — Community & Developer Relations | **Sonar** |
| May 2022 – Jan 2023 | Sr. Director — Developer Advocacy | **JFrog** |
| Mar 2020 – May 2022 | Director — Head of Developer Relations & Community | **Docker, Inc.** |
| May 2017 – Mar 2020 | Senior Engineering Manager | **Docker, Inc.** |
| Feb 2014 – May 2017 | Director of Technology | **Supernaut** |

Earlier: senior + architect roles at Click Security, Checkmate Technologies, MarketVine (Storyd), Perficient, and 8+ years on the dell.com engineering team.

## Skills

- **Languages & runtimes** — Rust, TypeScript, JavaScript, Node.js, Python, Java, .NET
- **AI / ML** — Anthropic Claude, OpenAI, Ollama, RAG, pgvector, agentic workflows, tool use / function calling, multi-provider LLM abstraction, VAPI, prompt engineering
- **Web & frontend** — React, Next.js, Redux, Angular, Tailwind v4
- **Backend & APIs** — Express, Restify, REST / JSON APIs, NextAuth v5, OAuth, webhooks, RESP wire protocol
- **Databases & storage** — PostgreSQL, Prisma, Redis, MongoDB, Elasticsearch, pgvector
- **Cloud & serverless** — AWS, Lambda, API Gateway, GCP, Docker, Kubernetes, Docker Swarm, Terraform
- **Systems & architecture** — Tokio async runtime, shared-nothing multi-shard, extendible hashing, multi-tenant SaaS, RBAC, monorepos, event-driven systems, dependency injection
- **Tooling & testing** — Vitest, Puppeteer, Lightpanda, Tavily, pnpm / npm workspaces, Commander

---

## Speaking & writing

### Press

> "Applications will start or are already using AI technology to augment or totally replace knowledgebases."
> — [Forbes](https://www.forbes.com/sites/joemckendrick/2024/02/28/how-well-be-interacting-with-ai-as-it-takes-on-more-work/)

> "As developers adopt AI for productivity benefits, there's a required responsibility to gut-check what it produces."
> — [InfoWorld](https://www.infoworld.com/article/2336089/10-ways-generative-ai-will-transform-software-development.html)

> "Gen-AI coding assistants are good at suggesting code, but not at stepping back and reflecting on the code and reasoning over its effectiveness."
> — [Techzine](https://www.techzine.eu/blogs/applications/121222/sonar-developer-lead-programming-past-the-pitfalls-with-ai-generated-code/)

### Selected talks & podcasts

- **[How to Get Started with Docker](https://www.youtube.com/watch?v=iqqDU2crIEQ)** — DockerCon / YouTube, 2020 (430K+ views)
- **[Continuous Previews with Infrastructure as Code](https://www.pulumi.com/resources/continuous-previews-infrastructure-as-code/)** — Pulumi, 2021
- **[Docker for Python Developers](https://talkpython.fm/episodes/show/308/docker-for-python-developers-2021-edition)** — Talk Python to Me, Ep. 308
- **[Leveraging AI for Secure DevOps](https://testguild.com/podcast/performance/p158-peter/)** — Test Guild Podcast

### Selected writing

- **[Say "No" to "NoOps": Why We Can't Afford to Let AI Run Wild](https://devops.com/say-no-to-noops-why-we-cant-afford-to-let-ai-run-wild/)** — DevOps.com
- **[Bad Code Stalls Developer Velocity](https://thenewstack.io/bad-code-stalls-developer-velocity/)** — The New Stack
- **[#CleanCodeTips: Unlock Your Coding Potential](https://www.sonarsource.com/blog/cleancodetips-unlock-your-coding-potential/)** — Sonar
- **[Getting Started with Docker Using Node.js](https://www.docker.com/blog/getting-started-with-docker-using-node-jspart-i/)** — Docker Blog
- **[How to Use the NGINX Docker Official Image](https://www.docker.com/blog/how-to-use-the-official-nginx-docker-image/)** — Docker Blog

### From the blog

- **[The Trust Threshold: Senior Engineers Are Already Crossing It](https://petermckee.dev/blog/the-trust-threshold--senior-engineers-are-already-crossing-it)**
- **[Building ShrikeDB's Extendible Hash Table](https://petermckee.dev/blog/building-shrikedb-extendible-hashing)**
- **[Rebuilding This Site with Next.js](https://petermckee.dev/blog/rebuilding-my-site-with-nextjs)**

More at **[petermckee.dev/blog](https://petermckee.dev/blog)** ([RSS](https://petermckee.dev/rss.xml)).

---

## Get in touch

- 🌐 **Site & blog** — [petermckee.dev](https://petermckee.dev)
- ✉️ **Email** — [hello@petermckee.dev](mailto:hello@petermckee.dev)
- 💻 **GitHub** — [@pmckeetx](https://github.com/pmckeetx)
- 📄 **Resume** — [PDF](https://petermckee.dev/PeterMcKeeDevResume.pdf)

---

<details>
<summary>About this repo</summary>

This repo is the source of [petermckee.dev](https://petermckee.dev) — built with Next.js (Pages Router), TypeScript, and Chakra UI v2, deployed on Vercel. Originally forked from [hrishikeshpaul/portfolio-template-v2](https://github.com/hrishikeshpaul/portfolio-template-v2), then migrated to Next.js and substantially extended (blog with RSS/sitemap, dark-only theme, refreshed content and component styles).

To run it locally (requires Node 24+):

```shell
yarn install
yarn dev          # http://localhost:3000
yarn build        # postbuild regenerates rss.xml + sitemap.xml
```

Licensed under [MIT](LICENSE).

</details>
