import { useState } from 'react'
import { toast } from 'sonner'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

export default function GlassReservationSection() {
  const [form, setForm] = useState({ name: '', phone: '', date: '', guests: '2', note: '' })
  const { ref, isVisible } = useScrollAnimation()

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Vui lòng nhập tên'); return }
    if (!form.phone.trim()) { toast.error('Vui lòng nhập số điện thoại'); return }
    if (!form.date) { toast.error('Vui lòng chọn ngày'); return }
    toast.success('Đặt bàn thành công!', { description: `Chúng tôi sẽ liên hệ với ${form.name} qua số ${form.phone}.` })
    setForm({ name: '', phone: '', date: '', guests: '2', note: '' })
  }

  return (
    <section
      id="glass-reservation"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-28 bg-surface transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-gold text-[10px] tracking-[0.5em] mb-3">LIÊN HỆ</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-dark tracking-wide mb-4">ĐẶT BÀN</h2>
          <div className="w-12 h-px bg-gold/60 mx-auto" />
        </div>

        <form onSubmit={handleSubmit} className="bg-white/85 backdrop-blur-md border border-gold/15 shadow-md shadow-gold/[0.05] rounded-sm p-8 space-y-5">
          {[
            { name: 'name', label: 'Họ và Tên', type: 'text', placeholder: 'Nguyễn Văn A' },
            { name: 'phone', label: 'Số Điện Thoại', type: 'tel', placeholder: '0901 234 567' },
            { name: 'date', label: 'Ngày & Giờ', type: 'datetime-local', placeholder: '' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-brand-dark/50 text-[10px] tracking-[0.3em] mb-2">{field.label.toUpperCase()}</label>
              <input
                name={field.name}
                type={field.type}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full bg-white/80 border border-gold/20 text-brand-dark text-sm px-4 py-3 rounded-sm placeholder:text-brand-dark/25 focus:outline-none focus:border-gold/50 transition-all"
              />
            </div>
          ))}

          <div>
            <label className="block text-brand-dark/50 text-[10px] tracking-[0.3em] mb-2">SỐ KHÁCH</label>
            <select
              name="guests"
              value={form.guests}
              onChange={handleChange}
              className="w-full bg-white/80 border border-gold/20 text-brand-dark text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-gold/50 transition-all appearance-none"
            >
              {['1','2','3','4','5','6+'].map((n) => <option key={n} value={n} className="bg-surface">{n} khách</option>)}
            </select>
          </div>

          <div>
            <label className="block text-brand-dark/50 text-[10px] tracking-[0.3em] mb-2">GHI CHÚ</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={3}
              placeholder="Yêu cầu đặc biệt..."
              className="w-full bg-white/80 border border-gold/20 text-brand-dark text-sm px-4 py-3 rounded-sm placeholder:text-brand-dark/25 focus:outline-none focus:border-gold/50 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gold/90 hover:bg-gold text-brand-dark font-bold text-xs tracking-[0.3em] transition-colors duration-200"
          >
            XÁC NHẬN ĐẶT BÀN
          </button>
        </form>
      </div>
    </section>
  )
}
