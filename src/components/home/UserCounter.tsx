import type React from "react"
import { useState, useEffect } from "react"
import { UsersIcon } from "lucide-react"

interface UserCounterProps {
  targetCount: number
  duration?: number
}

const UserCounter: React.FC<UserCounterProps> = ({ targetCount, duration = 4000 }) => {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const element = document.getElementById("user-counter")
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationFrameId: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const currentCount = Math.floor(progress * targetCount)

      setCount(currentCount)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step)
      }
    }

    animationFrameId = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isVisible, targetCount, duration])

  return (
    <div
      id="user-counter"
      className="inline-flex items-center px-5 py-3 bg-surface/80 backdrop-blur-sm rounded-full border border-border"
    >
      <UsersIcon className="w-5 h-5 text-marketing-highlight mr-3" />
      <span className="text-foreground">
        Join our{" "}
        <span className="text-marketing-highlight-secondary">
          {count.toLocaleString()}+
        </span>{" "}
        users
        <span className="hidden sm:inline"> mastering LeetCode today</span>
      </span>
    </div>
  )
}

export default UserCounter

