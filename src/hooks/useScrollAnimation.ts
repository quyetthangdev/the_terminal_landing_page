import { useEffect, useRef, useState } from 'react'

export function useScrollAnimation(threshold = 0.15) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const observedRef = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold },
    )
    observerRef.current = observer
    return () => observer.disconnect()
  }, [threshold])

  const stableProxyRef = useRef<typeof elementRef>(null!)
  if (!stableProxyRef.current) {
    stableProxyRef.current = new Proxy(elementRef, {
      set(target, prop, value) {
        Reflect.set(target, prop, value)
        if (prop === 'current' && value && observerRef.current && !observedRef.current) {
          observerRef.current.observe(value)
          observedRef.current = true
        }
        return true
      },
    })
  }

  return { ref: stableProxyRef.current, isVisible }
}
