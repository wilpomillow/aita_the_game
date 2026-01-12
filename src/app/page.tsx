// src/app/page.tsx
import QuizDeck from "@/components/QuizDeck"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50 text-zinc-800">
      <div className="relative mx-auto max-w-3xl px-4 pt-8 pb-10 md:pt-10 md:pb-14">
        {/* splotted glow background */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[720px] -translate-x-1/2 rounded-full bg-[rgba(255,69,0,0.10)] blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-24 h-56 w-56 rounded-full bg-[rgba(255,69,0,0.12)] blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-[rgba(255,69,0,0.09)] blur-3xl" />
        <div className="pointer-events-none absolute left-16 bottom-10 h-64 w-64 rounded-full bg-[rgba(255,69,0,0.08)] blur-3xl" />
        <div className="pointer-events-none absolute right-10 bottom-24 h-52 w-52 rounded-full bg-[rgba(255,69,0,0.10)] blur-3xl" />

        <header className="mb-8 flex flex-col items-center gap-2 text-center">
        <h1 className="font-display text-4xl leading-none md:text-5xl">
          Am I the Asshole?
        </h1>
        <span className="-mt-0.5 block text-sm font-medium uppercase tracking-widest text-zinc-500">
          the game | by Wilpo Millow
        </span>

          <p className="mx-auto max-w-xl text-xs leading-relaxed text-zinc-600 sm:text-sm">
            Pick <b className="text-[rgba(255,69,0,1)]">YTA</b> if you think the poster’s the asshole, or{" "}
            <b>NTA</b> if you think they’re not.
          </p>

        </header>

        <QuizDeck />
      </div>
    </main>
  )
}
