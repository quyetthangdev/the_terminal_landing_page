import { useState } from 'react'
import type { FormEvent } from 'react'

interface Props {
  correctPin: string
  onSuccess: () => void
}

export default function PinGate({ correctPin, onSuccess }: Props) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (input === correctPin) {
      onSuccess()
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div className="min-h-screen bg-brand-darker flex items-center justify-center">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8 w-full max-w-sm">
        <p className="font-display text-gold text-center text-xl mb-2">THE TERMINAL</p>
        <p className="text-[10px] tracking-[0.2em] text-[#555] text-center uppercase mb-8">Quản lý</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={8}
            value={input}
            onChange={e => { setInput(e.target.value); setError(false) }}
            placeholder="Nhập PIN"
            autoFocus
            className="w-full bg-[#111] border border-[#333] rounded px-4 py-3 text-center text-[#f5f0e8] text-lg tracking-[0.3em] outline-none focus:border-[#C9A84C44]"
          />
          {error && <p className="text-red-400 text-[11px] text-center">PIN không đúng</p>}
          <button
            type="submit"
            className="w-full bg-gold text-brand-dark font-bold text-[12px] tracking-[0.2em] py-3 rounded"
          >
            VÀO TRANG QUẢN LÝ
          </button>
        </form>
      </div>
    </div>
  )
}
