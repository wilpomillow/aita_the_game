"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { RefreshCcw, Trophy, Sparkles, CheckCircle2, XCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { CardItem } from "@/lib/types"

type Verdict = "correct" | "wrong"

const SCORE_KEY = "mdx-tinder-quiz:score"
const USED_KEY = "mdx-tinder-quiz:used-slugs"
const GAME_SIZE = 5

function shuffle<T>(arr: T[]) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function loadScore() {
  if (typeof window === "undefined") return { correct: 0, wrong: 0 }
  try {
    const raw = sessionStorage.getItem(SCORE_KEY)
    if (!raw) return { correct: 0, wrong: 0 }
    return JSON.parse(raw)
  } catch {
    return { correct: 0, wrong: 0 }
  }
}

function saveScore(s: { correct: number; wrong: number }) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(SCORE_KEY, JSON.stringify(s))
}

function loadUsed(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = sessionStorage.getItem(USED_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : []
  } catch {
    return []
  }
}

function saveUsed(slugs: string[]) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(USED_KEY, JSON.stringify(slugs))
}

function pickGame(pool: CardItem[], used: string[], n = GAME_SIZE) {
  const usedSet = new Set(used)
  const fresh = pool.filter((c: any) => c?.slug && !usedSet.has(c.slug))
  const source = fresh.length >= n ? fresh : pool
  const picked = shuffle(source).slice(0, Math.min(n, source.length))
  const pickedSlugs = picked.map((c: any) => c.slug)
  const nextUsed = source === pool ? pickedSlugs : [...used, ...pickedSlugs]
  return { picked, nextUsed }
}

function expectedChoiceFromVerdict(v: unknown): "yes" | "no" | null {
  if (typeof v !== "string") return null
  const s = v.trim().toLowerCase()

  if (
    s === "yta" ||
    s.includes("you’re the asshole") ||
    s.includes("you're the asshole") ||
    s.includes("yes the asshole") ||
    (s.includes("asshole") && !s.includes("not"))
  ) {
    return "yes"
  }

  if (s === "nta" || s.includes("not the asshole") || s.includes("no not the asshole") || (s.includes("not") && s.includes("asshole"))) {
    return "no"
  }

  return null
}

function canonicalVerdictLabel(v: unknown): "YTA" | "NTA" | "UNKNOWN" {
  const expected = expectedChoiceFromVerdict(v)
  if (expected === "yes") return "YTA"
  if (expected === "no") return "NTA"
  return "UNKNOWN"
}

export default function QuizDeck() {
  const [cards, setCards] = useState<CardItem[]>([])
  const [pool, setPool] = useState<CardItem[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  const [revealOpen, setRevealOpen] = useState(false)
  const [lastPick, setLastPick] = useState<"yes" | "no" | null>(null)
  const [verdict, setVerdict] = useState<Verdict | null>(null)

  const [score, setScore] = useState(() => loadScore())
  const scoreRef = useRef(score)
  scoreRef.current = score

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch("/api/cards", { cache: "no-store" })
        const data = await res.json()
        if (!alive) return

        const all = shuffle((data.cards ?? []) as CardItem[])
        setPool(all)

        const used = loadUsed()
        const { picked, nextUsed } = pickGame(all, used, GAME_SIZE)
        saveUsed(nextUsed)

        setCards(picked)
        setIndex(0)
        setVerdict(null)
        setRevealOpen(false)
        setLastPick(null)
      } catch {
        // noop
      } finally {
        if (alive) setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [])

  const current = cards[index]
  const total = cards.length
  const progress = total ? Math.round((index / total) * 100) : 0
  const done = index >= total && total > 0

  function reshuffle() {
    const used = loadUsed()
    const { picked, nextUsed } = pickGame(pool, used, GAME_SIZE)
    saveUsed(nextUsed)

    setCards(picked)
    setIndex(0)
    setVerdict(null)
    setRevealOpen(false)
    setLastPick(null)
  }

  function resetScore() {
    const next = { correct: 0, wrong: 0 }
    setScore(next)
    saveScore(next)
    reshuffle()
  }

  function answer(choice: "yes" | "no") {
    if (!current) return
    const expected = expectedChoiceFromVerdict((current as any).topCommentVerdict)
    const ok = expected ? choice === expected : false

    setLastPick(choice)
    setVerdict(ok ? "correct" : "wrong")
    setRevealOpen(true)

    const nextScore = {
      correct: scoreRef.current.correct + (ok ? 1 : 0),
      wrong: scoreRef.current.wrong + (ok ? 0 : 1),
    }

    setScore(nextScore)
    saveScore(nextScore)
  }

  function nextCard() {
    setRevealOpen(false)
    setVerdict(null)
    setLastPick(null)
    setIndex((v) => v + 1)
  }

  const ctrlPill =
    "inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-xl border border-black/10 bg-white px-3 py-2 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition hover:bg-zinc-50"

  const correctPill = "rounded-xl border border-[#FF4500]/30 bg-[#FF4500]/95 text-white"
  const wrongPill = "rounded-xl border border-[#FF4500]/20 bg-[#FF4500]/10 text-[#FF4500]/70"

  const topVerdict = canonicalVerdictLabel((current as any)?.topCommentVerdict)
  const topSummary = typeof (current as any)?.topCommentSummary === "string" ? ((current as any).topCommentSummary as string) : ""
  const sourceUrl = typeof (current as any)?.source === "string" ? ((current as any).source as string) : ""

  const verdictIcon =
    verdict === "correct" ? <CheckCircle2 className="h-5 w-5 text-[#FF4500]" /> : <XCircle className="h-5 w-5 text-[#FF4500]/70" />

  const shownIndex = loading ? 0 : Math.min(index + 1, Math.max(total, 1))

  return (
    <section className="grid gap-6">
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/80 shadow-[0_1px_6px_rgba(0,0,0,0.05)] backdrop-blur">
        <div className="grid grid-cols-1 items-stretch sm:grid-cols-[auto_1fr]">
          <div className="flex items-center justify-between gap-3 bg-[#FF4500] px-4 py-3 sm:py-4">
            <div className="inline-flex items-center gap-2 rounded-xl bg-[#FF4500] px-3 py-2">
              <Trophy className="h-5 w-5 text-white" />
              <span className="font-display text-xl uppercase tracking-wide text-white">SCORE</span>
            </div>

            <span className="sm:hidden font-display text-lg text-white/90">
              {shownIndex}
              <span className="mx-1 text-white/70">/</span>
              <span className="text-white/70">{total}</span>
            </span>
          </div>

          <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:py-4">
            <div className="hidden shrink-0 sm:flex items-baseline gap-3">
              <span className="font-display text-xl text-zinc-700">
                {shownIndex}
                <span className="mx-1 text-zinc-400">/</span>
                <span className="text-zinc-400">{total}</span>
              </span>
            </div>

            <div className="grid w-full grid-cols-4 gap-2 sm:gap-3">
              {/* Correct */}
              <Badge
                className={`${correctPill} w-full min-w-[48px] justify-center px-3 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm shadow-none before:hidden after:hidden`}
              >
                <span className="sm:hidden">✅</span>
                <span className="hidden sm:inline">🫏</span>
                <span className="ml-1">{score.correct}</span>
              </Badge>

              {/* Wrong */}
              <Badge
                className={`${wrongPill} w-full min-w-[48px] justify-center px-3 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm shadow-none before:hidden after:hidden`}
              >
                ❌ <span className="ml-1">{score.wrong}</span>
              </Badge>

              {/* Shuffle */}
              <button
                type="button"
                onClick={reshuffle}
                className={`${ctrlPill} w-full min-w-[48px] justify-center px-3 shadow-none before:hidden after:hidden`}
                aria-label="Shuffle"
                title="Shuffle"
              >
                <Sparkles className="h-4 w-4 text-[#FF4500]" />
                <span className="hidden sm:inline text-sm font-medium">Shuffle</span>
              </button>

              {/* Reset */}
              <button
                type="button"
                onClick={resetScore}
                className={`${ctrlPill} w-full min-w-[48px] justify-center px-3 shadow-none before:hidden after:hidden`}
                aria-label="Reset"
                title="Reset"
              >
                <RefreshCcw className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-medium">Reset</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-3xl pb-2">
        <div className="relative h-[540px]">
          {done ? (
            <div className="comic-card flex h-full items-center justify-center rounded-2xl bg-white p-8 text-center">
              <div>
                <h2 className="font-display text-4xl">Deck complete</h2>
                <p className="mt-2 text-zinc-600">Shuffle to play again</p>
                <div className="mt-6 flex justify-center gap-3">
                  <Button onClick={reshuffle}>Play again</Button>
                  <Button variant="outline" onClick={resetScore}>
                    Reset score
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {current && (
                <motion.div
                  key={current.slug}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 0.985, y: 10 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    x: verdict === "correct" ? 8 : verdict === "wrong" ? -8 : 0,
                    rotate: verdict === "correct" ? 0.5 : verdict === "wrong" ? -0.5 : 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: verdict === "correct" ? 220 : verdict === "wrong" ? -220 : 0,
                    rotate: verdict === "correct" ? 4 : verdict === "wrong" ? -4 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 520, damping: 36 }}
                >
                  <Card className="comic-card flex h-full flex-col rounded-2xl bg-white">
                    <CardHeader>
                      <CardTitle className="text-3xl">{(current as any).title}</CardTitle>
                      <CardDescription>
                        <span className="rounded bg-[#FF4500]/15 px-1">YTA</span> if they’re the asshole,{" "}
                        <span className="rounded bg-zinc-100 px-1">NTA</span> if they’re not.
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="prose max-w-none flex-1 overflow-auto prose-headings:font-display prose-p:font-body prose-strong:font-extrabold">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{(current as any).body}</ReactMarkdown>
                    </CardContent>

                    <CardFooter className="relative mt-auto border-t border-black/5 p-4">
                      <div className="mx-auto flex w-full max-w-xl gap-3">
                        <Button
                          variant="outline"
                          size="lg"
                          className="flex-1 justify-center font-display text-2xl font-normal tracking-wide"
                          disabled={revealOpen}
                          onClick={() => answer("no")}
                        >
                          NTA
                        </Button>

                        <Button
                          size="lg"
                          className="flex-1 justify-center bg-[#FF4500] font-display text-2xl font-normal tracking-wide text-white hover:bg-[#FF4500]/90"
                          disabled={revealOpen}
                          onClick={() => answer("yes")}
                        >
                          YTA
                        </Button>
                      </div>

                      <AnimatePresence>
                        {revealOpen && (
                          <motion.div
                            className="absolute inset-0 z-20 flex items-center justify-center rounded-b-2xl bg-white/95 backdrop-blur"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <div className="mx-auto w-full max-w-xl px-4">
                              <Button
                                onClick={nextCard}
                                className="h-16 w-full justify-center bg-[#FF4500] font-display text-xl text-white hover:bg-[#FF4500]/90"
                              >
                                NEXT
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardFooter>

                    <AnimatePresence>
                      {revealOpen && (
                        <motion.div
                          className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/92 p-6 backdrop-blur"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="w-full max-w-xl">
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {verdictIcon}
                                <span className="text-sm font-medium text-zinc-700">
                                  {verdict === "correct" ? "Matched the top vote" : "Didn’t match the top vote"}
                                </span>
                              </div>

                              <span className="text-xs text-zinc-500">
                                You picked{" "}
                                <span className="font-semibold text-zinc-700">{lastPick === "yes" ? "YTA" : "NTA"}</span>
                              </span>
                            </div>

                            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <div className="text-xs uppercase tracking-widest text-zinc-500">Top comment verdict</div>
                                  <div className="mt-1 font-display text-4xl leading-none text-zinc-900">
                                    {topVerdict === "UNKNOWN" ? "—" : topVerdict}
                                  </div>
                                </div>

                                <button
                                  onClick={nextCard}
                                  aria-label="Close"
                                  className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>

                              <div className="mt-4 text-sm text-zinc-700">
                                <div className="text-xs uppercase tracking-widest text-zinc-500">Top comment summary</div>
                                <p className="mt-2 leading-relaxed">{topSummary || "No summary provided."}</p>

                                {sourceUrl && (
                                  <div className="mt-3 text-xs text-zinc-400">
                                    <a
                                      href={sourceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-600"
                                    >
                                      source
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {!done && total > 0 && (
          <div className="mt-2 space-y-0.5">
            <div className="flex justify-between text-[11px] text-zinc-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
      </div>
    </section>
  )
}
