import { useEffect, useRef, useState } from 'react'

export function useScrollAnimation(threshold = 0.15) {
  const [isVisible, setIsVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const refRef = useRef<HTMLElement>(null)
  const observedRef = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold },
    )
    observerRef.current = observer

    return () => observer.disconnect()
  }, [threshold])

  // Create a proxy ref that observes when accessed
  const ref = new Proxy(refRef, {
    set(target, prop, value) {
      Reflect.set(target, prop, value)

      if (prop === 'current' && value && observerRef.current && !observedRef.current) {
        observerRef.current.observe(value)
        observedRef.current = true
      }

      return true
    },
  }) as typeof refRef

  return { ref, isVisible }
}
