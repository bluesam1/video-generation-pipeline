"use client"

import { useState } from "react"
import { Plus, Search, Play } from "lucide-react"
import { Input } from "@/components/ui/input"
import { EyewearLogo } from "@/components/eyewear-logo"
import { ThemeToggle } from "@/components/theme-toggle"

export type Project = {
  id: string
  name: string
  thumbnail: string
  createdAt: Date
}

interface HomeScreenProps {
  onCreateNew: () => void
  onSelectProject: (project: Project) => void
}

export function HomeScreen({ onCreateNew, onSelectProject }: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock projects
  const projects: Project[] = [
    {
      id: "1",
      name: "Summer Collection Launch",
      thumbnail: "/eyewear-product-display-minimalist.jpg",
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Urban Style Campaign",
      thumbnail: "/person-wearing-stylish-eyewear-outdoors.jpg",
      createdAt: new Date("2024-01-10"),
    },
  ]

  const filteredProjects = projects.filter((project) => project.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center">
            <EyewearLogo className="size-10" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">FrameCraft</h1>
        </div>
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-b border-border">
          <div className="max-w-6xl mx-auto px-8 py-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  Create Stunning Video Ads for Your Eyewear Brand
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  FrameCraft streamlines the entire video ad creation process. From concept to final export, create
                  professional-quality video advertisements for your eyewear collection in minutes, not hours.
                </p>
                <button
                  onClick={onCreateNew}
                  className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors"
                >
                  <Plus className="size-5" />
                  Create New Ad
                </button>
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl border border-border">
                <img
                  src="/stylish-eyewear-product-hero.jpg"
                  alt="Eyewear video ad preview"
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-white/90 dark:bg-black/70 shadow-lg backdrop-blur-sm hover:bg-white dark:hover:bg-black/80 transition-colors cursor-pointer">
                    <Play className="size-8 text-accent fill-accent ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Title and Search */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">Your Projects</h2>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* New Project Card */}
              <button
                onClick={onCreateNew}
                className="group border-2 border-dashed border-border hover:border-accent rounded-lg p-8 flex flex-col items-center justify-center gap-4 min-h-[280px] transition-colors"
              >
                <div className="flex size-20 items-center justify-center rounded-full bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                  <Plus className="size-10" />
                </div>
                <span className="text-lg font-medium text-foreground">New Project</span>
              </button>

              {/* Existing Projects */}
              {filteredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="group border border-border hover:border-accent rounded-lg overflow-hidden transition-colors text-left"
                >
                  <div className="aspect-video w-full bg-muted overflow-hidden">
                    <img
                      src={project.thumbnail || "/placeholder.svg"}
                      alt={project.name}
                      className="size-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-foreground line-clamp-1">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">Created {project.createdAt.toLocaleDateString()}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
