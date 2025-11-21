"use client"

import type React from "react"

import { useState } from "react"
import { ScenesStep } from "@/components/scenes-step"
import { VideoEditorStep } from "@/components/video-editor-step"
import { VideoStep } from "@/components/video-step"
import { ThemeToggle } from "@/components/theme-toggle"
import { EyewearLogo } from "@/components/eyewear-logo"
import { TemplateSelectionStep, type Template } from "@/components/template-selection-step"
import { HomeScreen, type Project } from "@/components/home-screen"
import { Pencil, HomeIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export type Concept = {
  id: string
  title: string
  description: string
  thumbnail: string
}

export type Scene = {
  id: string
  description: string
  thumbnail: string
}

export type Character = {
  id: string
  name: string
  image: string
}

export default function Home() {
  const [view, setView] = useState<"home" | "project">("home")
  const [projectName, setProjectName] = useState<string>("")
  const [isEditingProjectName, setIsEditingProjectName] = useState(false)
  const [editingProjectName, setEditingProjectName] = useState<string>("")
  const [step, setStep] = useState<"template" | "scenes" | "editor" | "video">("template")
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null)
  const [scenes, setScenes] = useState<Scene[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  const handleConceptSelected = (concept: Concept) => {
    setSelectedConcept(concept)
  }

  const handleProceedToScenes = (conceptScenes: Scene[], conceptCharacters: Character[]) => {
    setScenes(conceptScenes)
    const elementsFromAssets: Character[] = [
      {
        id: "baby-default",
        name: "Baby",
        image: "/cute-baby-cartoon-face.png",
      },
      ...conceptCharacters.map((character) => ({
        id: character.id,
        name: character.name,
        image: character.image,
      })),
    ]
    setCharacters(elementsFromAssets)
    setStep("scenes")
  }

  const handleGenerateVideo = () => {
    setStep("editor")
  }

  const handleExportVideo = () => {
    setStep("video")
  }

  const handleStartOver = () => {
    setView("home")
    setProjectName("")
    setStep("template")
    setSelectedConcept(null)
    setScenes([])
    setCharacters([])
    setSelectedTemplate(null)
  }

  const handleTemplateSelected = (template: Template) => {
    setSelectedTemplate(template)
    setProjectName(template.title)

    const mockScenes: Scene[] = [
      {
        id: "1",
        description:
          "Close-up of stylish eyewear on a minimalist display, highlighting the elegant frame design and premium materials.",
        thumbnail: "/eyewear-product-display-minimalist.jpg",
      },
      {
        id: "2",
        description:
          "Person wearing the glasses in natural outdoor lighting, showcasing how they complement various face shapes and styles.",
        thumbnail: "/person-wearing-stylish-eyewear-outdoors.jpg",
      },
      {
        id: "3",
        description:
          "Product detail shots showing craftsmanship: frame hinges, lens clarity, and brand logo with dramatic lighting.",
        thumbnail: "/eyewear-detail-craftsmanship-close-up.jpg",
      },
    ]

    const placeholderElements: Character[] = [
      {
        id: "model-default",
        name: "Model",
        image: "/stylish-model-portrait.jpg",
      },
      {
        id: "logo-default",
        name: "Logo",
        image: "",
      },
      {
        id: "product-default",
        name: "Product",
        image: "",
      },
    ]

    setScenes(mockScenes)
    setCharacters(placeholderElements)
    setStep("scenes")
  }

  const handleCreateNewProject = () => {
    setView("project")
    setStep("template")
  }

  const handleSelectProject = (project: Project) => {
    setProjectName(project.name)
    setView("project")
    setStep("template")
  }

  const navigateToStep = (stepNum: number) => {
    const stepMap: Record<number, "template" | "scenes" | "editor" | "video"> = {
      1: "template",
      2: "scenes",
      3: "editor",
      4: "video",
    }

    if (stepNum <= currentStepNumber) {
      setStep(stepMap[stepNum])
    }
  }

  const currentStepNumber = step === "template" ? 1 : step === "scenes" ? 2 : step === "editor" ? 3 : 4

  const handleStartEditingName = () => {
    setEditingProjectName(projectName)
    setIsEditingProjectName(true)
  }

  const handleSaveProjectName = () => {
    if (editingProjectName.trim()) {
      setProjectName(editingProjectName.trim())
    }
    setIsEditingProjectName(false)
  }

  const handleProjectNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveProjectName()
    } else if (e.key === "Escape") {
      setIsEditingProjectName(false)
    }
  }

  const handleGoHome = () => {
    setView("home")
  }

  const handleBackFromScenes = () => {
    setStep("template")
  }

  const handleBackFromEditor = () => {
    setStep("scenes")
  }

  const handleProjectNameChange = (newName: string) => {
    setProjectName(newName)
  }

  if (view === "home") {
    return <HomeScreen onCreateNew={handleCreateNewProject} onSelectProject={handleSelectProject} />
  }

  return (
    <main className="h-screen bg-background flex flex-col overflow-hidden">
      <div className="sticky top-0 z-50 bg-background flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center">
            <EyewearLogo className="size-10" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">FrameCraft</h1>
          <Button variant="ghost" size="sm" onClick={handleGoHome} className="size-8 p-0" title="Go to Home">
            <HomeIcon className="size-4" />
          </Button>
          {projectName && step !== "template" && (
            <>
              <span className="text-muted-foreground">/</span>
              {isEditingProjectName ? (
                <Input
                  value={editingProjectName}
                  onChange={(e) => setEditingProjectName(e.target.value)}
                  onBlur={handleSaveProjectName}
                  onKeyDown={handleProjectNameKeyDown}
                  className="h-7 w-48 text-sm"
                  autoFocus
                />
              ) : (
                <button
                  onClick={handleStartEditingName}
                  className="flex items-center gap-1 text-sm text-foreground hover:text-accent transition-colors group"
                >
                  <span>{projectName}</span>
                  <Pencil className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {["Select Template", "Configure Scenes", "Video Editor", "Export Video"].map((stepName, idx) => {
            const stepNum = idx + 1
            const isActive = stepNum === currentStepNumber
            const isCompleted = stepNum < currentStepNumber
            const isClickable = isCompleted || isActive

            return (
              <div key={stepName} className="flex items-center">
                {idx > 0 && <div className={`h-px w-8 mx-2 ${isCompleted ? "bg-accent" : "bg-border"}`} />}
                <button
                  onClick={() => navigateToStep(stepNum)}
                  disabled={!isClickable}
                  className={`flex items-center gap-2 ${isClickable ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed"} transition-opacity`}
                  title={!isActive ? stepName : undefined}
                >
                  <div
                    className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : isCompleted
                          ? "bg-accent/20 text-accent"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {stepNum}
                  </div>
                  {isActive && <span className="text-sm font-medium text-foreground">{stepName}</span>}
                </button>
              </div>
            )
          })}
          <div className="ml-4">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {step === "template" && <TemplateSelectionStep onNext={handleTemplateSelected} />}
        {step === "scenes" && (
          <ScenesStep
            scenes={scenes}
            characters={characters}
            onScenesUpdated={setScenes}
            onCharactersUpdated={setCharacters}
            onGenerateVideo={handleGenerateVideo}
            onBack={handleBackFromScenes}
            selectedTemplate={selectedTemplate}
            projectName={projectName}
            onProjectNameChange={handleProjectNameChange}
          />
        )}
        {step === "editor" && (
          <VideoEditorStep scenes={scenes} onExport={handleExportVideo} onBack={handleBackFromEditor} />
        )}
        {step === "video" && <VideoStep onStartOver={handleStartOver} />}
      </div>
    </main>
  )
}
