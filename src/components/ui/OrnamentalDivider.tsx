export default function OrnamentalDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-px bg-gold/30" />
      <span className="text-gold text-xs">◆</span>
      <div className="flex-1 h-px bg-gold/30" />
    </div>
  )
}
