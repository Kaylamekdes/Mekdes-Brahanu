// Designed empty frame (docs/03), in the dark theme: a dot grid, four corner
// ticks and a bracketed mono label. It must never look finished. The caller
// sets the shape (aspect ratio, radius, outline) through className.
export default function PlaceholderFrame({ label, note, className = '' }: { label: string; note: string; className?: string }) {
  const tick = 'absolute h-4 w-4 border-paper'
  return (
    <div className={`relative overflow-hidden bg-frame bg-[radial-gradient(rgba(255,255,255,.14)_1px,transparent_1px)] bg-[length:18px_18px] ${className}`}>
      <span aria-hidden="true" className={`${tick} top-4 left-4 border-t border-l`} />
      <span aria-hidden="true" className={`${tick} top-4 right-4 border-t border-r`} />
      <span aria-hidden="true" className={`${tick} bottom-4 left-4 border-b border-l`} />
      <span aria-hidden="true" className={`${tick} right-4 bottom-4 border-r border-b`} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
        <div className="font-mono text-label text-paper uppercase">{label}</div>
        <div className="font-mono text-label-sm text-muted uppercase">{note}</div>
      </div>
    </div>
  )
}
