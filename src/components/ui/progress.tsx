export function Progress({ value, className }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-black/10 ${className}`}>
      <div
        className="h-full bg-[rgba(255,69,0,1)] transition-all"
        style={{ width: `${v}%` }}
      />
    </div>
  )
}
