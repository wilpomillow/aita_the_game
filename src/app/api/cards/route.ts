import { NextResponse } from "next/server"
import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"
import { z } from "zod"

const CardFrontmatter = z.object({
  id: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  title: z.string(),
  slug: z.string().optional(),
  source: z.string().optional(),
  subreddit: z.string().optional(),
  topCommentSummary: z.string().optional(),
  topCommentVerdict: z.string().optional(),
})

export type CardDTO = {
  id: number
  title: string
  slug: string
  body: string
  source?: string
  subreddit?: string
  topCommentSummary?: string
  topCommentVerdict?: string
}

function normalizeFrontmatterDelimiters(raw: string) {
  const s = raw.replace(/\r\n/g, "\n")

  if (!s.startsWith("---\n")) return raw

  const exactDelims = (s.match(/^---\s*$/gm) ?? []).length
  if (exactDelims >= 2) return raw

  // If the closing delimiter is indented (e.g. "    ---"), unindent the FIRST one we find.
  // This preserves the opening "---" and makes gray-matter recognize the closing fence.
  const fixed = s.replace(/^\s+---\s*$/m, "---")
  return fixed.replace(/\n/g, "\r\n") // keep windows newlines consistent if you want
}

export async function GET() {
  const dir = path.join(process.cwd(), "content", "cards")
  const entries = await fs.readdir(dir, { withFileTypes: true })

  const cards: CardDTO[] = []
  const skipped: Array<{ file: string; error: string }> = []

  for (const e of entries) {
    if (!e.isFile()) continue
    if (!e.name.endsWith(".mdx") && !e.name.endsWith(".md")) continue

    const full = path.join(dir, e.name)

    let raw: string
    try {
      raw = await fs.readFile(full, "utf-8")
    } catch (err: any) {
      skipped.push({ file: e.name, error: `read failed: ${String(err?.message ?? err)}` })
      continue
    }

    raw = normalizeFrontmatterDelimiters(raw)

    let parsed: matter.GrayMatterFile<string>
    try {
      parsed = matter(raw)
    } catch (err: any) {
      skipped.push({ file: e.name, error: `frontmatter parse failed: ${String(err?.message ?? err)}` })
      continue
    }

    const fm = CardFrontmatter.safeParse(parsed.data)
    if (!fm.success) {
      skipped.push({ file: e.name, error: `frontmatter schema invalid: ${fm.error.message}` })
      continue
    }

    const fileSlug = e.name.replace(/\.(mdx|md)$/, "")
    const slug = (fm.data.slug || fileSlug).trim()

    cards.push({
      id: fm.data.id,
      title: fm.data.title,
      slug,
      body: String(parsed.content || "").trim(),
      source: fm.data.source,
      subreddit: fm.data.subreddit,
      topCommentSummary: fm.data.topCommentSummary,
      topCommentVerdict: fm.data.topCommentVerdict,
    })
  }

  cards.sort((a, b) => a.id - b.id)

  return NextResponse.json({ cards, skipped })
}
