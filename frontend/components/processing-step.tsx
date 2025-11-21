'use client'

import { useEffect, useState, useRef } from 'react'
import { Progress } from '@/components/ui/progress'
import { Sparkles } from 'lucide-react'

type ProcessingStepProps = {
  onComplete: () => void
}

export function ProcessingStep({ onComplete }: ProcessingStepProps) {
  const [progress, setProgress] = useState(0)
  const hasCompletedRef = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + (100 / 20)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress >= 100 && !hasCompletedRef.current) {
      hasCompletedRef.current = true
      onComplete()
    }
  }, [progress, onComplete])

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-accent/10 animate-pulse">
            <Sparkles className="size-10 text-accent" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-foreground">Generating Your Video</h2>
          <p className="text-muted-foreground text-balance">
            Our AI is crafting your video ad. This typically takes about 20 seconds.
          </p>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="animate-pulse">Processing scenes...</p>
        </div>
      </div>
    </div>
  )
}
