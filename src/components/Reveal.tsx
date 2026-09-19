import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react'

type RevealProps<T extends ElementType> = {
  children: ReactNode
  delay?: number
  y?: number
  duration?: number
  threshold?: number
  className?: string
  as?: T
} & Omit<ComponentPropsWithoutRef<T>, 'children' | 'className' | 'as'>

export default function Reveal<T extends ElementType = 'div'>({
  children,
  delay = 0,
  y = 24,
  duration = 700,
  threshold = 0.15,
  className = '',
  as,
  ...rest
}: RevealProps<T>) {
  const Tag = (as ?? 'div') as ElementType
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(node)
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  return (
    <Tag
      ref={ref}
      {...rest}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
        transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
        opacity: visible ? 1 : 0,
      }}
      className={`transition-[transform,opacity] ease-out will-change-transform ${className}`}
    >
      {children}
    </Tag>
  )
}
