"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Play,
  Loader2,
  RefreshCw,
  Upload,
  Pencil,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import Image from "next/image"
import { useState, useRef } from "react"
import type { Scene, Character } from "@/app/page"
import type { Template } from "@/components/template-selection-step"

type ScenesStepProps = {
  scenes: Scene[]
  characters: Character[]
  onScenesUpdated: (scenes: Scene[]) => void
  onCharactersUpdated: (characters: Character[]) => void
  onGenerateVideo: () => void
  onBack: () => void
  selectedTemplate: Template | null
  projectName: string
  onProjectNameChange: (name: string) => void
}

export function ScenesStep({
  scenes,
  characters,
  onScenesUpdated,
  onCharactersUpdated,
  onGenerateVideo,
  onBack,
  selectedTemplate,
  projectName,
  onProjectNameChange,
}: ScenesStepProps) {
  const [selectedElement, setSelectedElement] = useState<Character | null>(null)
  const [elementDescription, setElementDescription] = useState("")
  const [generatedOptions, setGeneratedOptions] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const [regeneratingImages, setRegeneratingImages] = useState<Set<string>>(new Set())
  const [isRegeneratingModel, setIsRegeneratingModel] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingElement, setUploadingElement] = useState<Character | null>(null)

  const [adDescription, setAdDescription] = useState(selectedTemplate?.bulletPoints || "")

  const handleSceneUpdate = (sceneId: string, newDescription: string) => {
    const updatedScenes = scenes.map((scene) =>
      scene.id === sceneId ? { ...scene, description: newDescription } : scene,
    )
    onScenesUpdated(updatedScenes)

    setRegeneratingImages((prev) => new Set(prev).add(sceneId))

    setTimeout(() => {
      const updatedScenesWithImage = updatedScenes.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              thumbnail: `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(newDescription.slice(0, 50))}`,
            }
          : scene,
      )
      onScenesUpdated(updatedScenesWithImage)
      setRegeneratingImages((prev) => {
        const next = new Set(prev)
        next.delete(sceneId)
        return next
      })
    }, 2000)
  }

  const handleElementClick = (character: Character) => {
    if (character.id === "model-default") {
      setSelectedElement(character)
      setElementDescription("stylish model portrait wearing eyewear")
      setGeneratedOptions(["/model-variant-1.jpg", "/model-variant-2.jpg", "/model-variant-3.jpg"])
      setSelectedOption(null)
    }
  }

  const handleRegenerateOptions = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setGeneratedOptions([
        `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(elementDescription + " option A")}`,
        `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(elementDescription + " option B")}`,
        `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(elementDescription + " option C")}`,
      ])
      setIsGenerating(false)
      setSelectedOption(null)
    }, 1500)
  }

  const handleApplyOption = () => {
    if (selectedElement && selectedOption) {
      const updatedCharacters = characters.map((char) =>
        char.id === selectedElement.id ? { ...char, image: selectedOption } : char,
      )
      onCharactersUpdated(updatedCharacters)
      setSelectedElement(null)
    }
  }

  const handleRegenerateModel = () => {
    const modelElement = characters.find((char) => char.id === "model-default")
    if (!modelElement) return

    setIsRegeneratingModel(true)

    setTimeout(() => {
      const newModelImage = `/placeholder.svg?height=400&width=400&query=${encodeURIComponent("stylish model portrait variant " + Date.now())}`
      const updatedCharacters = characters.map((char) =>
        char.id === "model-default" ? { ...char, image: newModelImage } : char,
      )
      onCharactersUpdated(updatedCharacters)
      setIsRegeneratingModel(false)
    }, 2000)
  }

  const handleFileUpload = (element: Character) => {
    setUploadingElement(element)
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && uploadingElement) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        const updatedCharacters = characters.map((char) =>
          char.id === uploadingElement.id ? { ...char, image: imageUrl } : char,
        )
        onCharactersUpdated(updatedCharacters)
        setUploadingElement(null)
      }
      reader.readAsDataURL(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const [variables, setVariables] = useState([
    {
      id: "var-2",
      label: "Product Name",
      value: "Aviator Elite Pro",
      helpText: "The name of the eyewear collection being advertised",
    },
  ])

  const handleVariableChange = (id: string, newValue: string) => {
    setVariables((prev) => prev.map((v) => (v.id === id ? { ...v, value: newValue } : v)))
  }

  const [isEditingProjectName, setIsEditingProjectName] = useState(false)
  const [editingProjectName, setEditingProjectName] = useState(projectName)

  const [expandedScenes, setExpandedScenes] = useState<Set<string>>(new Set())

  const toggleSceneExpanded = (sceneId: string) => {
    setExpandedScenes((prev) => {
      const next = new Set(prev)
      if (next.has(sceneId)) {
        next.delete(sceneId)
      } else {
        next.add(sceneId)
      }
      return next
    })
  }

  const handleSaveProjectName = () => {
    if (editingProjectName.trim()) {
      onProjectNameChange(editingProjectName.trim())
    } else {
      setEditingProjectName(projectName)
    }
    setIsEditingProjectName(false)
  }

  const handleProjectNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveProjectName()
    } else if (e.key === "Escape") {
      setEditingProjectName(projectName)
      setIsEditingProjectName(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl space-y-12 px-6 py-8">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 space-y-8">
            {/* Project Name */}
            <div>
              {isEditingProjectName ? (
                <Input
                  value={editingProjectName}
                  onChange={(e) => setEditingProjectName(e.target.value)}
                  onBlur={handleSaveProjectName}
                  onKeyDown={handleProjectNameKeyDown}
                  className="text-3xl font-bold h-auto py-2 border-2"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => {
                    setEditingProjectName(projectName)
                    setIsEditingProjectName(true)
                  }}
                  className="flex items-center gap-2 text-3xl font-bold text-foreground hover:text-accent transition-colors group"
                >
                  <span>{projectName}</span>
                  <Pencil className="size-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>

            {/* Elements Section */}
            <section>
              <h2 className="mb-6 text-2xl font-semibold text-foreground">Elements</h2>

              {/* Images subsection */}
              <div className="mb-8">
                <div className="flex flex-wrap gap-6">
                  {characters.map((character) => (
                    <div key={character.id} className="flex flex-col items-center gap-2">
                      <Card
                        className="overflow-hidden transition-shadow hover:shadow-lg w-24 h-24 relative cursor-pointer p-0"
                        onClick={() => {
                          if (character.id === "logo-default" || character.id === "product-default") {
                            handleFileUpload(character)
                          } else if (character.id === "model-default" && !isRegeneratingModel) {
                            handleElementClick(character)
                          }
                        }}
                      >
                        {character.id === "model-default" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleElementClick(character)
                            }}
                            className="absolute top-1 right-1 z-10 rounded-full bg-background/80 p-1 hover:bg-background transition-colors"
                            title="Edit model image"
                          >
                            <Pencil className="size-3 text-foreground" />
                          </button>
                        )}
                        <div className="relative size-full overflow-hidden p-0">
                          {isRegeneratingModel && character.id === "model-default" ? (
                            <div className="flex size-full items-center justify-center">
                              <Loader2 className="size-6 animate-spin text-muted-foreground" />
                            </div>
                          ) : (character.id === "logo-default" || character.id === "product-default") &&
                            !character.image ? (
                            <div className="flex size-full flex-col items-center justify-center border-2 border-dashed border-red-500 bg-red-50 dark:bg-red-950/20">
                              <Upload className="size-8 text-red-500" />
                              <span className="mt-1 text-[10px] text-red-600 dark:text-red-400 text-center px-1 font-medium">
                                Upload Required
                              </span>
                            </div>
                          ) : (
                            <Image
                              src={character.image || "/placeholder.svg"}
                              alt={character.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                      </Card>
                      <span className="text-xs font-medium text-foreground text-center">{character.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {false && (
                <div className="space-y-4">
                  {variables.map((variable) => (
                    <div key={variable.id} className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">{variable.label}</label>
                      <div>
                        <Input
                          value={variable.value}
                          onChange={(e) => handleVariableChange(variable.id, e.target.value)}
                          className="max-w-md"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{variable.helpText}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Template Card - right column */}
          {selectedTemplate && (
            <div className="w-80 shrink-0">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Selected Template
              </h3>
              <Card className="overflow-hidden">
                <div className="aspect-video relative">
                  <Image
                    src={selectedTemplate.thumbnail || "/placeholder.svg"}
                    alt={selectedTemplate.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-2">{selectedTemplate.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{selectedTemplate.description}</p>
                </div>
              </Card>
            </div>
          )}
        </div>

        <section className="hidden">
          <h2 className="mb-6 text-2xl font-semibold text-foreground">Ad Description</h2>
          <Textarea
            value={adDescription}
            onChange={(e) => setAdDescription(e.target.value)}
            className="min-h-[200px] resize-none text-base"
            placeholder="Describe your ad concept and key points..."
          />
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-semibold text-foreground">Scenes</h2>
          <div className="space-y-4">
            {scenes.map((scene, index) => {
              const isExpanded = expandedScenes.has(scene.id)

              return (
                <Card key={scene.id} className="overflow-hidden">
                  <button
                    onClick={() => toggleSceneExpanded(scene.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-32 aspect-video overflow-hidden rounded bg-muted shrink-0">
                        {regeneratingImages.has(scene.id) ? (
                          <div className="flex size-full items-center justify-center">
                            <Loader2 className="size-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          <Image
                            src={scene.thumbnail || "/placeholder.svg"}
                            alt={`Scene ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-foreground">Scene {index + 1}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{scene.description}</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="size-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-5 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 border-t">
                      <div className="flex gap-4">
                        <div className="relative w-64 shrink-0">
                          <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                            {regeneratingImages.has(scene.id) ? (
                              <div className="flex size-full items-center justify-center">
                                <Loader2 className="size-8 animate-spin text-muted-foreground" />
                              </div>
                            ) : (
                              <Image
                                src={scene.thumbnail || "/placeholder.svg"}
                                alt={`Scene ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <Textarea
                            value={scene.sceneData ? JSON.stringify(scene.sceneData, null, 2) : scene.description}
                            onChange={(e) => {
                              try {
                                const parsedData = JSON.parse(e.target.value)
                                const updatedScenes = scenes.map((s) =>
                                  s.id === scene.id ? { ...s, sceneData: parsedData } : s
                                )
                                onScenesUpdated(updatedScenes)
                              } catch (error) {
                                // Invalid JSON, just update the raw value temporarily
                                const updatedScenes = scenes.map((s) =>
                                  s.id === scene.id ? { ...s, description: e.target.value } : s
                                )
                                onScenesUpdated(updatedScenes)
                              }
                            }}
                            rows={20}
                            className="resize-none font-mono text-xs"
                            placeholder="Scene data..."
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </section>

        <div className="pb-8 flex gap-3">
          <Button variant="outline" onClick={onBack} size="lg" className="flex-1 bg-transparent">
            Back
          </Button>
          <Button onClick={onGenerateVideo} size="lg" className="flex-1 gap-2">
            <Play className="size-4" />
            Generate Video
          </Button>
        </div>
      </div>

      {selectedElement && selectedElement.id === "model-default" && (
        <Dialog open={!!selectedElement} onOpenChange={(open) => !open && setSelectedElement(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Model Image</DialogTitle>
              <DialogDescription>
                Describe the model you want to feature in your eyewear ad, then choose from the generated options.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Generation Prompt</label>
                <Input
                  value={elementDescription}
                  onChange={(e) => setElementDescription(e.target.value)}
                  placeholder="Describe what you want to generate..."
                  className="mt-1.5"
                />
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Generated Options</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerateOptions}
                    disabled={isGenerating}
                    className="gap-2 bg-transparent"
                  >
                    {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                    Regenerate
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {generatedOptions.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(option)}
                      className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                        selectedOption === option ? "border-primary shadow-md" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="aspect-square w-full bg-muted/30">
                        <Image
                          src={option || "/placeholder.svg"}
                          alt={`Option ${idx + 1}`}
                          fill
                          className="object-contain p-4"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedElement(null)}>
                Cancel
              </Button>
              <Button onClick={handleApplyOption} disabled={!selectedOption}>
                Apply Selection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
