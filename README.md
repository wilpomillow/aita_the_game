# AITA The Game (Next.js + shadcn/ui)

A simple, Vercel-friendly Next.js webapp that reads `content/cards/*.mdx` and shows each card like a card deck.
Users tap **Yes** / **No** to agree or disagree with the statement, and the app checks the answer stored in frontmatter.

## Quick start

```bash
npm i
npm run dev
```

Open http://localhost:3000

## Add / edit cards

Create a new file under `content/cards/` like:

```mdx
---
id: 42
title: "Bananas are berries."
correct: "yes" # yes = true/agree, no = false/disagree
---

Bananas are botanically classified as berries.
```

Notes:
- The deck renders the MDX body as Markdown (no custom MDX components).
- `id` must be unique.
- `correct` must be `"yes"` or `"no"`.

## Deploy

Push to GitHub and import into Vercel. No special config needed.

