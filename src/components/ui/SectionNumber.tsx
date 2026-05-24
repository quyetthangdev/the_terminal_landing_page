export default function SectionNumber({ n }: { n: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' }) {
  return (
    <span className="absolute top-8 left-6 font-display text-[4rem] font-bold text-gold/6 leading-none select-none pointer-events-none hidden md:block">
      {n}
    </span>
  )
}
