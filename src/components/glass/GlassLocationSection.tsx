import { MapPin, Clock, Phone } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

const info = [
  { icon: MapPin, label: 'Địa chỉ', value: 'Số 3 Nguyễn Công Trứ\nThủ Đức, TP. Hồ Chí Minh' },
  { icon: Clock, label: 'Giờ mở cửa', value: 'Thứ 2 – Chủ Nhật\n07:00 – 22:00' },
  { icon: Phone, label: 'Liên hệ', value: '(028) 1234 5678\ninfo@theterminal.vn' },
]

export default function GlassLocationSection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section
      id="glass-location"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-28 bg-[#0d0d0d] transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-gold/60 text-[10px] tracking-[0.5em] mb-3">TÌM CHÚNG TÔI</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white tracking-wide">VỊ TRÍ</h2>
          <div className="w-12 h-px bg-gold/40 mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {info.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-sm p-6 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200">
              <Icon size={18} className="text-gold/70 mb-4" />
              <p className="text-white/30 text-[10px] tracking-[0.3em] mb-2">{label.toUpperCase()}</p>
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{value}</p>
            </div>
          ))}
        </div>

        {/* Map placeholder */}
        <div className="mt-6 h-48 bg-white/[0.03] border border-white/[0.08] rounded-sm flex items-center justify-center">
          <p className="text-white/20 text-xs tracking-widest">BẢN ĐỒ</p>
        </div>
      </div>
    </section>
  )
}
