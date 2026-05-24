import { MapPin, Clock, Phone, Mail } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

const hours = [
  { days: 'Thứ 2 – Thứ 6', time: '07:00 – 22:00' },
  { days: 'Thứ 7 – Chủ Nhật', time: '07:00 – 23:00' },
]

export default function LocationSection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section
      id="location"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-24 bg-pearl transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-gold text-xs tracking-[0.4em] mb-3">ĐỊA ĐIỂM</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-dark tracking-wide">
            TÌM CHÚNG TÔI
          </h2>
          <div className="w-12 h-px bg-gold mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Map */}
          <div className="aspect-[4/3] rounded-sm overflow-hidden border border-gold/20">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919!2d106.6!3d10.77!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzEyLjAiTiAxMDbCsDM2JzAwLjAiRQ!5e0!3m2!1svi!2svn!4v1000000000000!5m2!1svi!2svn"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="The Terminal location"
            />
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <p className="text-gold text-xs tracking-widest mb-5">THÔNG TIN LIÊN HỆ</p>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={14} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-brand-dark font-medium">Số 3 Nguyễn Công Trứ</p>
                    <p className="text-gray-500 text-sm">Thủ Đức, TP. Hồ Chí Minh</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center flex-shrink-0">
                    <Phone size={14} className="text-gold" />
                  </div>
                  <p className="text-brand-dark">0900 123 456</p>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center flex-shrink-0">
                    <Mail size={14} className="text-gold" />
                  </div>
                  <p className="text-brand-dark">hello@theterminal.vn</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-gold text-xs tracking-widest mb-5">GIỜ MỞ CỬA</p>
              <div className="space-y-3">
                {hours.map((h) => (
                  <div key={h.days} className="flex gap-4 items-center">
                    <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center flex-shrink-0">
                      <Clock size={14} className="text-gold" />
                    </div>
                    <div className="flex justify-between flex-1">
                      <span className="text-gray-600 text-sm">{h.days}</span>
                      <span className="text-brand-dark font-medium text-sm">{h.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
