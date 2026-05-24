import { useScrollAnimation } from '@/hooks/useScrollAnimation'

export default function GlassAboutSection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section
      id="glass-about"
      ref={ref as React.RefObject<HTMLElement>}
      className={`relative py-32 bg-surface overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      {/* Background accent */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gold/8 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Image with glass frame */}
        <div className="relative">
          <div className="aspect-[4/5] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&auto=format&fit=crop"
              alt="Không gian The Terminal"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Glass label overlay */}
          <div className="absolute bottom-4 left-4 bg-white/85 backdrop-blur-md border border-gold/20 px-4 py-3 rounded-sm">
            <p className="text-brand-dark/70 text-[10px] tracking-[0.3em]">THE TERMINAL</p>
            <p className="text-gold text-xs font-semibold tracking-wider">CAFE & EUROPEAN KITCHEN</p>
          </div>
        </div>

        {/* Glass content card */}
        <div className="bg-white/85 backdrop-blur-md border border-gold/15 shadow-md shadow-gold/[0.06] rounded-sm p-8 md:p-10">
          <p className="text-gold text-[10px] tracking-[0.5em] mb-6">CÂU CHUYỆN</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-dark leading-tight mb-6">
            Điểm dừng chân<br />
            <em className="font-normal text-gold-dark">giữa lòng thành phố</em>
          </h2>
          <div className="w-8 h-px bg-gold/50 mb-6" />
          <p className="text-brand-dark/70 text-sm leading-relaxed mb-4">
            Lấy cảm hứng từ những chuyến tàu hơi nước vàng son của thế kỷ XIX, The Terminal ra đời năm 2026 với sứ mệnh trở thành điểm hẹn văn hóa — nơi cà phê rang mộc Việt gặp gỡ ẩm thực châu Âu tinh tế trong một không gian industrial đặc trưng.
          </p>
          <p className="text-brand-dark/55 text-sm leading-relaxed">
            Mỗi góc quán là một câu chuyện: những bánh răng cưa sắt rỉ, đèn Edison ấm áp, gỗ cũ và đồng đập nổi — tất cả cộng hưởng để tạo nên một hành trình ẩm thực khó quên.
          </p>
        </div>
      </div>
    </section>
  )
}
