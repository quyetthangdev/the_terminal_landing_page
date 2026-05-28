import { useEffect, useMemo, useRef, useState } from 'react'

export function useScrollAnimation(threshold = 0.15) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold },
    )
    observerRef.current = observer
    if (elementRef.current) observer.observe(elementRef.current)
    return () => {
      observer.disconnect()
      observerRef.current = null
    }
  }, [threshold])

  // Setter-based ref so attaching the element after the effect runs still
  // triggers observe() — handles production build timing without Proxy.
  const ref = useMemo(() => ({
    get current(): HTMLElement | null { return elementRef.current },
    set current(el: HTMLElement | null) {
      elementRef.current = el
      if (el && observerRef.current) observerRef.current.observe(el)
    },
  }), [])

  return { ref, isVisible }
}
