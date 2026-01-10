import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-4 border-black px-3 py-1 text-xs font-extrabold shadow-comic",
  {
    variants: {
      variant: {
        default: "bg-yellow-200 text-black",
        correct: "bg-emerald-200 text-black",
        wrong: "bg-rose-200 text-black",
        neutral: "bg-zinc-100 text-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
