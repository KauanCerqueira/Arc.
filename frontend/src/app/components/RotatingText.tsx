"use client"

import { useState, useEffect } from "react"

interface RotatingTextProps {
  words: string[]
  className?: string
}

export default function RotatingText({ words, className = "" }: RotatingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length)
        setIsAnimating(false)
      }, 300)
    }, 3000)

    return () => clearInterval(interval)
  }, [words.length])

  return (
    <span
      className={`inline-block transition-all duration-300 min-w-[280px] sm:min-w-[320px] md:min-w-[380px] lg:min-w-[450px] text-left ${
        isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      } ${className}`}
    >
      {words[currentIndex]}
    </span>
  )
}
