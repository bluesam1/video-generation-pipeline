"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, ChevronRight, Search, Play } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export type Template = {
  id: string
  title: string
  description: string
  bulletPoints: string
  thumbnail: string
  scenes: string[]
  exampleVideos: string[]
}

type TemplateSelectionStepProps = {
  onNext: (selectedTemplate: Template) => void
}

type FilterCategory = {
  name: string
  options: string[]
}

const filterCategories: FilterCategory[] = [
  {
    name: "Ad Style",
    options: [
      "Minimalist & Clean",
      "Bold & Dramatic",
      "Lifestyle & Candid",
      "Luxury & Premium",
      "Tech & Futuristic",
      "Vintage & Retro",
      "Playful & Trendy",
      "Sophisticated",
    ],
  },
  {
    name: "Product Type",
    options: [
      "Sunglasses",
      "Prescription Glasses",
      "Sports Eyewear",
      "Blue Light Glasses",
      "Fashion Frames",
      "Reading Glasses",
      "Safety Glasses",
      "Designer Collections",
    ],
  },
  {
    name: "Video Pace",
    options: [
      "Fast & Snappy (TikTok style)",
      "Medium Flow (standard social ads)",
      "Slow & Elegant (luxury storytelling)",
      "Rhythmic / Beat-Synced (trend-driven)",
      "Montage Style (quick cuts)",
      "Linear Story (steady, narrative)",
    ],
  },
  {
    name: "Setting / Environment",
    options: [
      "Studio/White Background",
      "Urban/City Streets",
      "Nature/Outdoors",
      "Indoor/Home",
      "Beach/Water",
      "Night/Evening",
      "Office/Professional",
      "Adventure/Sports",
    ],
  },
  {
    name: "Tone of Voice",
    options: [
      "Sophisticated",
      "Playful",
      "Professional",
      "Adventurous",
      "Minimalist",
      "Luxurious",
      "Confident",
      "Innovative",
    ],
  },
  {
    name: "Narration Style",
    options: ["Voiceover", "Text Only", "Music Only", "Model Testimonial", "Expert Opinion", "Silent/Visual Only"],
  },
  {
    name: "Main Emotional Driver",
    options: ["Confidence", "Style", "Protection", "Clarity", "Innovation", "Comfort", "Adventure", "Sophistication"],
  },
]

const templates: Template[] = [
  {
    id: "1",
    title: "The World Comes Into Focus",
    description:
      "A character puts on the stylish eyewear and the previously bland world is suddenly full of vibrant colors, confident people, and subtle visual gags. Each lens change shifts the overall vibe (cool, classy, playful), highlighting different styles while implying that the right frames change how you see yourself.",
    bulletPoints: `Hook: Character in a dull, muted world looking bored and uninspired.
Mid: Puts on stylish eyewear - world transforms into vibrant colors and energy.
End: Each lens style shift changes the vibe (cool, classy, playful).
Video pace: Dynamic with magical transformation moments`,
    thumbnail: "/template-world-focus.jpg",
    exampleVideos: ["/example-world-focus-1.jpg", "/example-world-focus-2.jpg", "/example-world-focus-3.jpg"],
    scenes: [
      "Scene 1: Grayscale world - character walks through bland environment, looking uninspired.",
      "Scene 2: Character puts on eyewear - world bursts into vivid colors and energy.",
      "Scene 3: Quick cuts showing different lens styles transforming the vibe and atmosphere.",
      "Scene 4: Character smiles at their reflection. Tagline: 'Change how you see yourself.'",
    ],
  },
  {
    id: "2",
    title: "Accidental Style Icon",
    description:
      "A totally average person keeps getting mistaken for a celebrity, influencer, or fashion model everywhere they go—just because of their eyewear. Paparazzi, VIP treatment, and red-carpet moments pile up, while the character insists they're just running errands.",
    bulletPoints: `Hook: Average person puts on eyewear, steps outside for errands.
Mid: Immediately mistaken for celebrity - paparazzi, VIP treatment, red carpet.
End: Character shrugs, smiles - it's just the glasses.
Video pace: Fast and comedic with escalating absurdity`,
    thumbnail: "/template-style-icon.jpg",
    exampleVideos: ["/example-style-icon-1.jpg", "/example-style-icon-2.jpg", "/example-style-icon-3.jpg"],
    scenes: [
      "Scene 1: Ordinary person putting on eyewear, grabbing coffee to-go.",
      "Scene 2: Paparazzi cameras flash, crowd gathers - mistaken for celebrity.",
      "Scene 3: VIP treatment escalates - red carpet, velvet ropes, autograph requests.",
      "Scene 4: Character looks at camera, shrugs with a smile. Text: 'It's the frames.'",
    ],
  },
  {
    id: "3",
    title: "Time-Traveling Frames",
    description:
      "Each time someone puts on the glasses, they briefly 'jump' into a different decade's fashion scene (70s disco, 80s neon, 90s grunge, modern minimalist). The same frames look great across eras, showing that the design is timeless, not trendy.",
    bulletPoints: `Hook: Person puts on glasses in modern setting.
Mid: Each blink transports them to different decades (70s, 80s, 90s).
End: Back to present - frames work everywhere. Tagline: "Timeless, not trendy."
Video pace: Fast cuts with era-appropriate music transitions`,
    thumbnail: "/template-time-travel.jpg",
    exampleVideos: ["/example-time-travel-1.jpg", "/example-time-travel-2.jpg", "/example-time-travel-3.jpg"],
    scenes: [
      "Scene 1: Modern minimalist setting - person puts on eyewear.",
      "Scene 2: Blink - 70s disco scene with same glasses, perfectly styled.",
      "Scene 3: Blink - 80s neon aesthetic, 90s grunge era - frames adapt to each.",
      "Scene 4: Back to present. Text: 'Timeless design. Every era.'",
    ],
  },
  {
    id: "4",
    title: "The Confidence Filter",
    description:
      "Split-screen versions of daily scenarios (interview, first date, presentation) with and without the eyewear. The 'with' version plays like a highlight reel: smoother jokes, better posture, easy charm. The brand doesn't claim superpowers—just the confidence that comes from loving how you look.",
    bulletPoints: `Hook: Split screen - same scenarios with and without eyewear.
Mid: "Without" side shows nervousness, "with" side shows confidence and charm.
End: Split merges - person wearing glasses, owning the moment.
Video pace: Dynamic split-screen with synchronized scenarios`,
    thumbnail: "/template-confidence-filter.jpg",
    exampleVideos: ["/example-confidence-1.jpg", "/example-confidence-2.jpg", "/example-confidence-3.jpg"],
    scenes: [
      "Scene 1: Split screen - job interview scenario, left nervous, right confident.",
      "Scene 2: First date scene - left awkward, right charming and relaxed.",
      "Scene 3: Presentation scenario - left uncertain, right commanding the room.",
      "Scene 4: Split merges showing confident person with eyewear. Text: 'Confidence looks good on you.'",
    ],
  },
  {
    id: "5",
    title: "Frame Matchmaker",
    description:
      "Eyewear is treated like a dating app for your face. A playful 'matchmaking' voiceover matches people with their ideal frames based on personality, hobbies, and quirks. Quick cuts show perfectly matched frames completing each person's unique look.",
    bulletPoints: `Hook: Dating app-style interface swiping through eyewear options.
Mid: Playful matchmaking voiceover pairs people with perfect frames.
End: Multiple matches shown - everyone finds their ideal pair.
Video pace: Quick and playful with dating app aesthetics`,
    thumbnail: "/template-frame-matchmaker.jpg",
    exampleVideos: ["/example-matchmaker-1.jpg", "/example-matchmaker-2.jpg", "/example-matchmaker-3.jpg"],
    scenes: [
      "Scene 1: Phone screen swiping through eyewear styles like a dating app.",
      "Scene 2: First 'match' - frames appear on person, perfect fit celebration.",
      "Scene 3: Quick cuts of different people matched with their ideal frames.",
      "Scene 4: Group shot - everyone wearing their perfect match. Text: 'Find your match.'",
    ],
  },
  {
    id: "6",
    title: "Spot the Main Character",
    description:
      "In busy scenes (subway, office, cafe), the camera glides past dozens of people until it lands on the one wearing the brand's glasses—clearly the 'main character' in every environment. The concept: anyone can be the lead in their own story, and the right frames make that obvious.",
    bulletPoints: `Hook: Crowded scene - camera searches through dozens of people.
Mid: Camera finds person wearing the eyewear - they stand out naturally.
End: Multiple environments, same effect. Tagline: "Be the main character."
Video pace: Smooth tracking shots with cinematic feel`,
    thumbnail: "/template-main-character.jpg",
    exampleVideos: ["/example-main-character-1.jpg", "/example-main-character-2.jpg", "/example-main-character-3.jpg"],
    scenes: [
      "Scene 1: Busy subway - camera glides past dozens of faces.",
      "Scene 2: Camera finds and focuses on person wearing the eyewear - spotlight effect.",
      "Scene 3: Same concept in office, café - always stands out naturally.",
      "Scene 4: Person makes eye contact with camera. Text: 'Your story. Your frames.'",
    ],
  },
  {
    id: "7",
    title: "The Compliment Magnet",
    description:
      "A shy character gets one small compliment on their eyewear, then the compliments escalate throughout the day: strangers, baristas, co-workers, even a video call full of people comment on the frames. By the end, the character walks with a totally new energy.",
    bulletPoints: `Hook: Shy person gets first compliment on new eyewear.
Mid: Compliments escalate - strangers, coworkers, everyone notices.
End: Character transforms from shy to confident, walking tall.
Video pace: Building momentum with escalating positive reactions`,
    thumbnail: "/template-compliment-magnet.jpg",
    exampleVideos: ["/example-compliment-1.jpg", "/example-compliment-2.jpg", "/example-compliment-3.jpg"],
    scenes: [
      "Scene 1: Shy character receives first small compliment on eyewear - small smile.",
      "Scene 2: Compliments escalate - barista, stranger, coworker all comment.",
      "Scene 3: Video call - entire screen of people commenting on the frames.",
      "Scene 4: Character walks with new confidence and energy. Text: 'Compliments included.'",
    ],
  },
  {
    id: "8",
    title: "Frames With a Double Life",
    description:
      "By day, the eyewear fits perfectly in a professional setting; by night, the same frames look effortlessly cool at a rooftop party or concert. Fast-paced transitions show how the frames adapt to different outfits, moods, and lighting without needing a wardrobe change.",
    bulletPoints: `Hook: Person in professional office setting wearing eyewear.
Mid: Fast transitions - same frames at rooftop party, concert, dinner.
End: One frame, infinite possibilities. Tagline: "Day to night style."
Video pace: Fast transitions with lighting and music shifts`,
    thumbnail: "/template-double-life.jpg",
    exampleVideos: ["/example-double-life-1.jpg", "/example-double-life-2.jpg", "/example-double-life-3.jpg"],
    scenes: [
      "Scene 1: Professional office environment - frames look sharp and polished.",
      "Scene 2: Quick transition to rooftop party - same frames, effortlessly cool.",
      "Scene 3: Concert venue, elegant dinner - frames adapt to every setting.",
      "Scene 4: Person in both settings side by side. Text: 'One frame. Every moment.'",
    ],
  },
  {
    id: "9",
    title: "The Frame Whisperer",
    description:
      "A quirky stylist character seems to 'hear' what people's faces are saying they need. In quick, funny mini-makeovers, they help each person find the right pair of frames, transforming their whole vibe. The underlying message: there's a perfect pair waiting for everyone.",
    bulletPoints: `Hook: Quirky stylist character approaches people, 'listens' to their face.
Mid: Quick makeovers - each person transformed with perfect frames.
End: Everyone happy with their match. Text: "Your perfect pair is waiting."
Video pace: Quick and playful with comedic timing`,
    thumbnail: "/template-frame-whisperer.jpg",
    exampleVideos: ["/example-whisperer-1.jpg", "/example-whisperer-2.jpg", "/example-whisperer-3.jpg"],
    scenes: [
      "Scene 1: Quirky stylist approaches unsure customer, dramatically 'listens' to their face.",
      "Scene 2: First mini-makeover - perfect frames appear, customer transforms.",
      "Scene 3: Multiple quick makeovers - different people, all finding their match.",
      "Scene 4: Group shot of satisfied customers. Text: 'The perfect pair knows you.'",
    ],
  },
  {
    id: "10",
    title: "Hidden Superfans",
    description:
      "Throughout a city, people quietly notice others wearing the same brand—tiny nods, knowing smiles, a secret shared between good-taste insiders. The ad slowly reveals a subtle 'club' of stylish eyewear fans who can spot each other instantly, simply by the frames they wear.",
    bulletPoints: `Hook: Person walks through city wearing the eyewear.
Mid: Subtle nods and smiles from strangers wearing same brand.
End: Reveals network of style insiders recognizing each other.
Video pace: Moderate with mysterious, insider vibe`,
    thumbnail: "/template-superfans.jpg",
    exampleVideos: ["/example-superfans-1.jpg", "/example-superfans-2.jpg", "/example-superfans-3.jpg"],
    scenes: [
      "Scene 1: Person walks through city wearing eyewear, going about their day.",
      "Scene 2: Stranger across the street wearing same brand - subtle nod of recognition.",
      "Scene 3: More encounters - café, park, office - knowing smiles exchanged.",
      "Scene 4: Reveal network of insiders throughout the city. Text: 'Those who know, know.'",
    ],
  },
]

export function TemplateSelectionStep({ onNext }: TemplateSelectionStepProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [selectedFilters, setSelectedFilters] = useState<Record<string, Set<string>>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [activeVideoIndex, setActiveVideoIndex] = useState(0)

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName)
    } else {
      newExpanded.add(categoryName)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleFilter = (categoryName: string, option: string) => {
    const newFilters = { ...selectedFilters }
    if (!newFilters[categoryName]) {
      newFilters[categoryName] = new Set()
    }

    const categoryFilters = new Set(newFilters[categoryName])
    if (categoryFilters.has(option)) {
      categoryFilters.delete(option)
    } else {
      categoryFilters.add(option)
    }

    newFilters[categoryName] = categoryFilters
    setSelectedFilters(newFilters)
  }

  const handleTemplateSelect = async (template: Template) => {
    setSelectedTemplate(template)
    setTimeout(async () => {
      await onNext(template)
    }, 300)
  }

  const handleTemplateClick = (template: Template) => {
    setPreviewTemplate(template)
  }

  const handleConfirmSelection = async () => {
    if (previewTemplate) {
      setSelectedTemplate(previewTemplate)
      await onNext(previewTemplate)
    }
  }

  const getFilteredTemplates = () => {
    const hasActiveFilters = Object.values(selectedFilters).some((set) => set.size > 0) || searchQuery.trim() !== ""

    if (!hasActiveFilters) {
      return templates
    }

    let filtered = templates
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (template) =>
          template.title.toLowerCase().includes(query) || template.description.toLowerCase().includes(query),
      )
    }

    if (Object.values(selectedFilters).some((set) => set.size > 0)) {
      const randomThreshold = 0.5 + Math.random() * 0.2
      filtered = filtered.filter(() => Math.random() > randomThreshold)
    }

    return filtered
  }

  const filteredTemplates = getFilteredTemplates()

  return (
    <div className="h-full flex">
      <div className="w-64 border-r border-border bg-background overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Filters</h3>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filterCategories.map((category) => {
              const isExpanded = expandedCategories.has(category.name)
              const categoryFilters = selectedFilters[category.name] || new Set()

              return (
                <div key={category.name} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm font-medium text-foreground">{category.name}</span>
                    {isExpanded ? (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-2 space-y-1 bg-muted/20">
                      {category.options.map((option) => {
                        const isSelected = categoryFilters.has(option)
                        return (
                          <button
                            key={option}
                            onClick={() => toggleFilter(category.name, option)}
                            className="w-full text-left px-3 py-2 text-xs rounded transition-colors hover:bg-muted flex items-start gap-2"
                          >
                            <Checkbox checked={isSelected} className="mt-0.5" />
                            <span className={isSelected ? "text-foreground" : "text-muted-foreground"}>{option}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Select a Template</h2>
              <p className="text-muted-foreground">
                {filteredTemplates.length === templates.length
                  ? "Choose a template to get started with your video ad"
                  : `Showing ${filteredTemplates.length} of ${templates.length} templates`}
              </p>
            </div>

            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No templates match your filters. Try adjusting your selection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateClick(template)}
                    className={`group relative flex flex-col rounded-lg border-2 transition-all hover:border-accent text-left ${
                      selectedTemplate?.id === template.id ? "border-accent bg-accent/5" : "border-border bg-card"
                    }`}
                  >
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute top-3 right-3 z-10 flex size-6 items-center justify-center rounded-full bg-accent">
                        <Check className="size-4 text-accent-foreground" />
                      </div>
                    )}

                    <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                      <img
                        src={template.thumbnail || "/placeholder.svg"}
                        alt={template.title}
                        className="size-full object-cover"
                      />
                    </div>

                    <div className="flex-1 p-4 text-left">
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{template.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">{template.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col p-0 gap-0">
          {previewTemplate && (
            <>
              <div className="p-6 pb-4 border-b sticky top-0 bg-background z-10">
                <DialogTitle className="text-2xl font-bold mb-4">{previewTemplate.title}</DialogTitle>
                <DialogDescription className="text-base w-full">{previewTemplate.description}</DialogDescription>
              </div>

              <div className="p-6 space-y-8">
                {/* Example Videos Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Example Videos</h3>
                  <div className="relative">
                    {/* Main video display */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted group cursor-pointer">
                      <img
                        src={previewTemplate.thumbnail || "/placeholder.svg"}
                        alt={`Example video ${activeVideoIndex + 1}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                        <div className="rounded-full bg-white/90 p-4 shadow-lg transition-transform group-hover:scale-110">
                          <Play className="h-8 w-8 text-primary fill-primary" />
                        </div>
                      </div>

                      {/* Video counter overlay */}
                      <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {activeVideoIndex + 1} / {previewTemplate.exampleVideos.length}
                      </div>
                    </div>

                    {/* Carousel dots */}
                    <div className="flex justify-center gap-2 mt-4">
                      {previewTemplate.exampleVideos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveVideoIndex(idx)}
                          className={`h-2 rounded-full transition-all ${
                            idx === activeVideoIndex
                              ? "w-8 bg-primary"
                              : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                          }`}
                          aria-label={`View video ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scene Summaries Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Scene Breakdown</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {previewTemplate.scenes.map((scene, idx) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-lg border bg-card/50">
                        <div className="flex-shrink-0 flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                            Scene {idx + 1}
                          </h4>
                          <p className="text-sm text-foreground">{scene.replace(/^Scene \d+: /, "")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-4 border-t mt-auto sticky bottom-0 bg-background">
                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmSelection} size="lg" className="px-8">
                    Choose Template
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
