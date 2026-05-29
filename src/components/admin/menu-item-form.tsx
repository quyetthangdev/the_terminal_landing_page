import { useState } from 'react'
import type { FormEvent } from 'react'
import type { MenuItem, Category } from '@/data/menu'

interface Props {
  categories: Category[]
  initial?: MenuItem
  onSave: (data: Omit<MenuItem, 'id'>) => void
  onCancel: () => void
}

export default function MenuItemForm({ categories, initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [price, setPrice] = useState(initial?.price ?? '')
  const [image, setImage] = useState(initial?.image ?? '')
  const [category, setCategory] = useState(initial?.category ?? categories[0]?.id ?? '')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSave({ name, description, price, image, category })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="mf-name" className="text-[10px] tracking-[0.15em] text-[#555] uppercase block mb-1">Tên món</label>
        <input id="mf-name" required value={name} onChange={e => setName(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-[13px] text-[#f5f0e8] focus:border-[#C9A84C44] outline-none" />
      </div>
      <div>
        <label htmlFor="mf-desc" className="text-[10px] tracking-[0.15em] text-[#555] uppercase block mb-1">Mô tả</label>
        <textarea id="mf-desc" value={description} onChange={e => setDescription(e.target.value)} rows={2}
          className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-[13px] text-[#f5f0e8] focus:border-[#C9A84C44] outline-none resize-none" />
      </div>
      <div>
        <label htmlFor="mf-price" className="text-[10px] tracking-[0.15em] text-[#555] uppercase block mb-1">Giá (vd: 185.000đ)</label>
        <input id="mf-price" required value={price} onChange={e => setPrice(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-[13px] text-[#f5f0e8] focus:border-[#C9A84C44] outline-none" />
      </div>
      <div>
        <label htmlFor="mf-image" className="text-[10px] tracking-[0.15em] text-[#555] uppercase block mb-1">URL ảnh</label>
        <input id="mf-image" value={image} onChange={e => setImage(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-[13px] text-[#f5f0e8] focus:border-[#C9A84C44] outline-none" />
      </div>
      <div>
        <label htmlFor="mf-cat" className="text-[10px] tracking-[0.15em] text-[#555] uppercase block mb-1">Danh mục</label>
        <select id="mf-cat" value={category} onChange={e => setCategory(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-[13px] text-[#f5f0e8] focus:border-[#C9A84C44] outline-none">
          {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 border border-[#333] text-[#888] text-[11px] tracking-[0.1em] py-2.5 rounded">
          HỦY
        </button>
        <button type="submit"
          className="flex-1 bg-gold text-brand-dark font-bold text-[11px] tracking-[0.1em] py-2.5 rounded">
          LƯU
        </button>
      </div>
    </form>
  )
}
