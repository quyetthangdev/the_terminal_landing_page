import PageSwitcher from '@/components/PageSwitcher'

export default function GlassPage() {
  return (
    <div className="min-h-screen bg-brand-darker flex items-center justify-center">
      <p className="text-white/40 text-sm tracking-widest">LIQUID GLASS — COMING SOON</p>
      <PageSwitcher current="glass" />
    </div>
  )
}
