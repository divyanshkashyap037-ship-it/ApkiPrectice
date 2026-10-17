import { useRef } from 'react'
import { AppleHelloEnglishEffect } from '@/components/ui/apple-hello-effect'

const HELLO_SPEED = 1.1
const HOLD_AFTER_MS = 420

export default function LoadingScreen({ onComplete }) {
  const finishedRef = useRef(false)

  const handleComplete = () => {
    if (finishedRef.current || !onComplete) return
    finishedRef.current = true
    window.setTimeout(() => onComplete(), HOLD_AFTER_MS)
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background px-6">
      <AppleHelloEnglishEffect
        speed={HELLO_SPEED}
        onAnimationComplete={handleComplete}
        className="h-16 w-auto max-w-[90vw] text-foreground sm:h-24 md:h-28 lg:h-32"
      />
    </div>
  )
}
