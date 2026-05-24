import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import OrnamentalDivider from '@/components/ui/OrnamentalDivider'
import SectionNumber from '@/components/ui/SectionNumber'

const stats = [
  { value: 'Est. 2026', label: 'Thành lập' },
  { value: '1 Tầng', label: 'Không gian' },
  { value: '120+', label: 'Chỗ ngồi' },
  { value: '50+', label: 'Món ăn' },
]

export default function AboutSection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section
      id="about"
      ref={ref as React.RefObject<HTMLElement>}
      className={`relative py-24 bg-white transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <SectionNumber n="I" />
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&auto=format&fit=crop"
                alt="Không gian The Terminal"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Gold L-bracket corners */}
            <div className="absolute -bottom-3 -right-3 w-16 h-16 border-r border-b border-gold/50" />
            <div className="absolute -top-3 -left-3 w-16 h-16 border-l border-t border-gold/50" />
          </div>

          {/* Text */}
          <div className="pt-4">
            <p className="text-gold text-[10px] tracking-[0.5em] mb-6">CÂU CHUYỆN CỦA CHÚNG TÔI</p>

            {/* Pull quote */}
            <blockquote className="font-display text-2xl md:text-3xl italic text-brand-dark leading-snug mb-8 border-l-2 border-gold pl-5">
              "Lấy cảm hứng từ những chuyến tàu hơi nước vàng son của thế kỷ XIX — một không gian industrial đặc trưng, nơi cà phê rang mộc Việt gặp gỡ ẩm thực châu Âu tinh tế."
            </blockquote>

            <OrnamentalDivider className="mb-8" />

            <p className="text-gray-500 text-sm leading-relaxed mb-10">
              Mỗi góc quán là một câu chuyện: những bánh răng cưa sắt rỉ, đèn Edison ấm áp, gỗ cũ và đồng đập nổi — tất cả cộng hưởng để tạo nên một hành trình ẩm thực khó quên tại The Terminal, thành lập năm 2026.
            </p>

            {/* Stats */}
            <OrnamentalDivider className="mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-display text-2xl font-bold text-gold mb-1">{s.value}</p>
                  <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
