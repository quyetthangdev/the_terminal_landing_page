import { useState } from 'react'
import { seller } from '@/data/seller'

const SETTINGS_KEY = 'terminal_settings'

export interface AdminSettings {
  restaurantName: string
  address: string
  taxCode: string
  phone: string
  invoiceSymbol: string
  pin: string
  vatRate: number
}

const defaults: AdminSettings = {
  restaurantName: seller.name,
  address: seller.address,
  taxCode: seller.taxCode,
  phone: seller.phone,
  invoiceSymbol: seller.invoiceSymbol,
  pin: '1234',
  vatRate: 0.1,
}

export function useSettings() {
  const [settings, setSettings] = useState<AdminSettings>(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY)
      return raw ? { ...defaults, ...(JSON.parse(raw) as Partial<AdminSettings>) } : defaults
    } catch {
      return defaults
    }
  })

  function updateSettings(patch: Partial<AdminSettings>): void {
    const next = { ...settings, ...patch }
    setSettings(next)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  }

  return { settings, updateSettings }
}
