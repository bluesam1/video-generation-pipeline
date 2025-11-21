'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type UploadedAsset = {
  id: string
  file: File
  preview: string
  type: 'logo' | 'product' | 'none'
}

type UploadAssetsStepProps = {
  onNext: (assets: UploadedAsset[]) => void
  onBack: () => void
}

export function UploadAssetsStep({ onNext, onBack }: UploadAssetsStepProps) {
  const [assets, setAssets] = useState<UploadedAsset[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFiles = (files: FileList) => {
    const newAssets: UploadedAsset[] = []
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const id = Math.random().toString(36).substr(2, 9)
        const preview = URL.createObjectURL(file)
        newAssets.push({ id, file, preview, type: 'none' })
      }
    })

    setAssets((prev) => [...prev, ...newAssets])
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files)
    }
  }

  const removeAsset = (id: string) => {
    setAssets((prev) => {
      const asset = prev.find((a) => a.id === id)
      if (asset) URL.revokeObjectURL(asset.preview)
      return prev.filter((a) => a.id !== id)
    })
  }

  const setAssetType = (id: string, type: 'logo' | 'product' | 'none') => {
    setAssets((prev) =>
      prev.map((asset) => (asset.id === id ? { ...asset, type } : asset))
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Upload Assets</h2>
            <p className="text-muted-foreground">
              Upload images like logos, product photos, or other visual assets for your ad.
            </p>
          </div>

          {assets.length === 0 ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
                isDragging
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-secondary/20'
              }`}
            >
              <Upload className="mb-4 size-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium text-foreground">
                Drop files here or click to browse
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Supports PNG, JPEG, GIF, and SVG images
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInput}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                  isDragging
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-secondary/20'
                }`}
              >
                <div className="text-center">
                  <Upload className="mx-auto mb-2 size-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drop more files or click to browse
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInput}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="group relative flex flex-col gap-2 rounded-lg border border-border bg-card p-2"
                  >
                    <div className="relative aspect-square overflow-hidden rounded bg-secondary">
                      <img
                        src={asset.preview || "/placeholder.svg"}
                        alt={asset.file.name}
                        className="size-full object-contain p-2"
                      />
                      <button
                        onClick={() => removeAsset(asset.id)}
                        className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-destructive/80 text-destructive-foreground opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
                      >
                        <X className="size-3" />
                      </button>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          setAssetType(asset.id, asset.type === 'logo' ? 'none' : 'logo')
                        }
                        className={`flex flex-1 items-center justify-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                          asset.type === 'logo'
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                        }`}
                      >
                        <Tag className="size-3" />
                        Logo
                      </button>
                      <button
                        onClick={() =>
                          setAssetType(
                            asset.id,
                            asset.type === 'product' ? 'none' : 'product'
                          )
                        }
                        className={`flex flex-1 items-center justify-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                          asset.type === 'product'
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                        }`}
                      >
                        <Tag className="size-3" />
                        Product
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border px-8 py-4">
        <div className="mx-auto flex max-w-4xl gap-3">
          <Button 
            variant="outline" 
            onClick={onBack} 
            size="lg"
            className="flex-1"
          >
            Back
          </Button>
          <Button 
            onClick={() => onNext(assets)} 
            size="lg"
            className="flex-1"
          >
            Next: Select Template
          </Button>
        </div>
      </div>
    </div>
  )
}
