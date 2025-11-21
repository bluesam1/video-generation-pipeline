'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, RefreshCw, Share2, Play } from 'lucide-react'

type VideoStepProps = {
  onStartOver: () => void
}

export function VideoStep({ onStartOver }: VideoStepProps) {
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col overflow-y-auto px-6 py-8">
      <div className="mx-auto w-full max-w-5xl flex-1 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-foreground">Your Video is Ready!</h1>
          <p className="text-muted-foreground text-balance">
            Preview your generated video ad below. You can download or share it.
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="relative aspect-video w-full bg-black">
            <img
              src="/happy-baby-with-diaper-product.jpg"
              alt="Video preview"
              className="size-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-white/90 shadow-lg transition-all hover:scale-110 hover:bg-white">
                <Play className="size-10 fill-accent text-accent" />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="gap-2">
            <Download className="size-4" />
            Download Video
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <Share2 className="size-4" />
            Share
          </Button>
          <Button size="lg" variant="outline" className="gap-2" onClick={onStartOver}>
            <RefreshCw className="size-4" />
            Create Another
          </Button>
        </div>

        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-foreground">Video Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium text-foreground">30 seconds</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resolution</p>
              <p className="font-medium text-foreground">1920x1080 (Full HD)</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Format</p>
              <p className="font-medium text-foreground">MP4</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">File Size</p>
              <p className="font-medium text-foreground">12.4 MB</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
