'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface StartStepProps {
  onNext: (projectName: string) => void
  onBack?: () => void
}

export function StartStep({ onNext, onBack }: StartStepProps) {
  const [projectName, setProjectName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (projectName.trim()) {
      onNext(projectName)
    }
  }

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-accent/10">
            <Sparkles className="size-8 text-accent" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground text-balance">
              Let's Create Your Ad
            </h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Start by giving your project a name
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Enter project name..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="text-lg h-14 px-4"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            {onBack && (
              <Button 
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1 h-12 text-base"
              >
                Back
              </Button>
            )}
            <Button 
              type="submit" 
              className="flex-1 h-12 text-base"
              disabled={!projectName.trim()}
            >
              Next: Upload Assets
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
