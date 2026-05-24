import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

const timeSlots = Array.from({ length: 31 }, (_, i) => {
  const totalMinutes = 7 * 60 + i * 30
  const h = Math.floor(totalMinutes / 60).toString().padStart(2, '0')
  const m = (totalMinutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
})

const occasions = ['Sinh nhật', 'Kỷ niệm', 'Hội họp', 'Hẹn hò', 'Khác']

interface FormState {
  name: string; phone: string; date: string; time: string
  guests: string; occasion: string; notes: string
}

const initial: FormState = { name: '', phone: '', date: '', time: '', guests: '', occasion: '', notes: '' }

export default function ReservationSection() {
  const [form, setForm] = useState<FormState>(initial)
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const { ref, isVisible } = useScrollAnimation()

  function validate(): boolean {
    const e: Partial<FormState> = {}
    if (!form.name.trim()) e.name = 'Vui lòng điền họ tên'
    if (!form.phone.trim()) e.phone = 'Vui lòng điền số điện thoại'
    if (!form.date) e.date = 'Vui lòng chọn ngày'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    toast('Cảm ơn bạn đã đặt bàn!', {
      description: 'Chúng tôi sẽ liên hệ xác nhận trong vòng 30 phút.',
    })
    setForm(initial)
    setErrors({})
  }

  function field(name: keyof FormState) {
    return {
      value: form[name],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [name]: e.target.value })),
    }
  }

  return (
    <section
      id="reservation"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-24 bg-brand-dark transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <div className="max-w-2xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-gold text-xs tracking-[0.4em] mb-3">TRẢI NGHIỆM</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white tracking-wide mb-3">
            ĐẶT BÀN TRƯỚC
          </h2>
          <p className="text-gold/70 text-sm italic">Chúng tôi sẽ xác nhận trong vòng 30 phút</p>
          <div className="w-12 h-px bg-gold mx-auto mt-6" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label htmlFor="res-name" className="block text-white/60 text-xs tracking-widest mb-2">
                HỌ & TÊN *
              </label>
              <Input
                id="res-name"
                placeholder="Nguyễn Văn A"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-gold focus:ring-gold rounded-none"
                aria-label="Họ & tên"
                {...field('name')}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="res-phone" className="block text-white/60 text-xs tracking-widest mb-2">
                SỐ ĐIỆN THOẠI *
              </label>
              <Input
                id="res-phone"
                type="tel"
                placeholder="0900 123 456"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-gold focus:ring-gold rounded-none"
                aria-label="Số điện thoại"
                {...field('phone')}
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Date */}
            <div>
              <label htmlFor="res-date" className="block text-white/60 text-xs tracking-widest mb-2">
                NGÀY *
              </label>
              <Input
                id="res-date"
                type="date"
                className="bg-white/5 border-white/10 text-white focus:border-gold focus:ring-gold rounded-none"
                aria-label="Ngày"
                {...field('date')}
              />
              {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
            </div>

            {/* Time */}
            <div>
              <label className="block text-white/60 text-xs tracking-widest mb-2">GIỜ</label>
              <Select value={form.time} onValueChange={(v) => setForm((f) => ({ ...f, time: v }))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-gold rounded-none">
                  <SelectValue placeholder="Chọn giờ" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Guests */}
            <div>
              <label className="block text-white/60 text-xs tracking-widest mb-2">SỐ NGƯỜI</label>
              <Select value={form.guests} onValueChange={(v) => setForm((f) => ({ ...f, guests: v }))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-gold rounded-none" aria-label="Số người">
                  <SelectValue placeholder="Số người" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} người</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Occasion */}
            <div>
              <label className="block text-white/60 text-xs tracking-widest mb-2">DỊP ĐẶC BIỆT</label>
              <Select value={form.occasion} onValueChange={(v) => setForm((f) => ({ ...f, occasion: v }))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-gold rounded-none">
                  <SelectValue placeholder="Không có (tùy chọn)" />
                </SelectTrigger>
                <SelectContent>
                  {occasions.map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="res-notes" className="block text-white/60 text-xs tracking-widest mb-2">
              GHI CHÚ THÊM
            </label>
            <Textarea
              id="res-notes"
              placeholder="Yêu cầu chỗ ngồi, dị ứng thực phẩm, trang trí..."
              rows={3}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-gold focus:ring-gold rounded-none resize-none"
              {...field('notes')}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gold text-brand-dark hover:bg-gold/90 tracking-[0.3em] text-xs py-6 rounded-none font-bold mt-2"
          >
            GỬI YÊU CẦU ĐẶT BÀN
          </Button>
        </form>
      </div>
    </section>
  )
}
