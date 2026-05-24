import { useScrollAnimation } from '@/hooks/useScrollAnimation'

const stats = [
  { value: 'Est. 2024', label: 'Thành lập' },
  { value: '3 Tầng', label: 'Không gian' },
  { value: '120+', label: 'Chỗ ngồi' },
  { value: '50+', label: 'Món ăn' },
]

export default function AboutSection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section
      id="about"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-24 bg-white transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-sm border border-gold/20">
              <img
                src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&auto=format&fit=crop"
                alt="Không gian The Terminal"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Gold accent corner */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-r-2 border-b-2 border-gold/40" />
          </div>

          {/* Text */}
          <div>
            <p className="text-gold text-xs tracking-[0.4em] mb-4">CÂU CHUYỆN CỦA CHÚNG TÔI</p>
            <div className="w-10 h-px bg-gold mb-6" />
            <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-dark leading-tight mb-6">
              Điểm dừng chân<br />giữa lòng thành phố
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Lấy cảm hứng từ những chuyến tàu hơi nước vàng son của thế kỷ XIX, The Terminal ra đời năm 2024 với sứ mệnh trở thành điểm hẹn văn hóa — nơi cà phê rang mộc Việt gặp gỡ ẩm thực châu Âu tinh tế trong một không gian industrial đặc trưng.
            </p>
            <p className="text-gray-600 leading-relaxed mb-10">
              Mỗi góc quán là một câu chuyện: những bánh răng cưa sắt rỉ, đèn Edison ấm áp, gỗ cũ và đồng đập nổi — tất cả cộng hưởng để tạo nên một hành trình ẩm thực khó quên.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-gold/20">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-display text-2xl font-bold text-gold mb-1">{s.value}</p>
                  <p className="text-xs text-gray-500 tracking-widest uppercase">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
