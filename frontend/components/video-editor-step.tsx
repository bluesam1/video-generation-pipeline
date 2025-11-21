'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, Play, Scissors, Volume2, Sparkles, Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import type { Scene } from '@/app/page'

type VideoEditorStepProps = {
  scenes: Scene[]
  onExport: () => void
  onBack: () => void
}

export function VideoEditorStep({ scenes, onExport, onBack }: VideoEditorStepProps) {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0)
  const [isProcessing, setIsProcessing] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsProcessing(false)
          return 100
        }
        return prev + (100 / 20)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleExport = () => {
    setIsExporting(true)
    onExport()
  }

  if (isProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex justify-center">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-accent/10 animate-pulse">
              <Sparkles className="size-10 text-accent" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold text-foreground">Generating Your Scenes</h2>
            <p className="text-muted-foreground text-balance">
              Our AI is crafting your video scenes. This typically takes about 20 seconds.
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

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden p-6">
        <div className="mx-auto w-full max-w-6xl flex-1 flex flex-col gap-4 min-h-0">
          <Card className="overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="w-full h-full bg-black relative group cursor-pointer">
              <img
                src="/happy-baby-with-diaper-product.jpg"
                alt="Video preview"
                className="size-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div className="flex size-20 items-center justify-center rounded-full bg-white/90 group-hover:bg-white transition-colors shadow-xl">
                  <Play className="size-10 text-black ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Timeline</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Scissors className="size-4" />
                  Trim
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Volume2 className="size-4" />
                  Audio
                </Button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {scenes.map((scene, index) => (
                <button
                  key={scene.id}
                  onClick={() => setSelectedSceneIndex(index)}
                  className={`group relative flex-shrink-0 rounded-lg border-2 transition-all ${
                    selectedSceneIndex === index
                      ? 'border-accent shadow-lg'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <div className="w-48 space-y-2 p-2">
                    <div className="relative aspect-video overflow-hidden rounded bg-muted">
                      <img
                        src={scene.thumbnail || "/placeholder.svg"}
                        alt={`Scene ${index + 1}`}
                        className="size-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="size-8 text-white" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-foreground">Scene {index + 1}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{scene.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="border-t border-border bg-background px-6 py-4 flex-shrink-0">
        <div className="mx-auto flex max-w-6xl gap-3">
          <Button 
            variant="outline"
            onClick={onBack} 
            size="lg" 
            className="flex-1"
            disabled={isExporting}
          >
            Back
          </Button>
          <Button 
            size="lg" 
            className="flex-1 gap-2" 
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="size-4" />
                Export Video
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
