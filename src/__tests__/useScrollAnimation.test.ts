import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

describe('useScrollAnimation', () => {
  let observe: ReturnType<typeof vi.fn>
  let disconnect: ReturnType<typeof vi.fn>
  let triggerCallback: (entries: Partial<IntersectionObserverEntry>[]) => void

  beforeEach(() => {
    observe = vi.fn()
    disconnect = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(function(cb: IntersectionObserverCallback) {
        triggerCallback = (entries) =>
          cb(entries as IntersectionObserverEntry[], {} as IntersectionObserver)
        return { observe, disconnect, unobserve: vi.fn() }
      }),
    )
  })

  afterEach(() => { vi.unstubAllGlobals() })

  it('returns isVisible=false initially', () => {
    const { result } = renderHook(() => useScrollAnimation())
    expect(result.current.isVisible).toBe(false)
  })

  it('sets isVisible=true when element intersects', () => {
    const { result } = renderHook(() => useScrollAnimation())
    act(() => {
      triggerCallback([{ isIntersecting: true }])
    })
    expect(result.current.isVisible).toBe(true)
  })

  it('calls observe on the ref element', () => {
    const { result } = renderHook(() => useScrollAnimation())
    const div = document.createElement('div')
    act(() => {
      result.current.ref.current = div
    })
    expect(observe).toHaveBeenCalledWith(div)
  })

  it('disconnects observer on unmount', () => {
    const { unmount } = renderHook(() => useScrollAnimation())
    unmount()
    expect(disconnect).toHaveBeenCalled()
  })
})
