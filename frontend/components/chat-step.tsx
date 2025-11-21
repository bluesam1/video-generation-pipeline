'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ConceptEditor } from '@/components/concept-editor'
import { Sparkles, Send, Loader2 } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import type { Concept, Scene, Character } from '@/app/page'

type Message = {
  role: 'user' | 'assistant'
  content: string
  options?: string[]
  questionType?: string
}

type ChatStepProps = {
  onConceptSelected: (concept: Concept) => void
  selectedConcept: Concept | null
  onProceedToScenes: (scenes: Scene[], characters: Character[]) => void
  initialPrompt?: string
  onBack: () => void
}

const clarifyingQuestions = [
  {
    question: "What visual style are you aiming for?",
    options: ['Cinematic', 'Minimal', 'Vibrant', 'Elegant', 'Bold', 'Natural'],
    type: 'style'
  },
  {
    question: "What mood should the ad convey?",
    options: ['Energetic', 'Calm', 'Inspiring', 'Playful', 'Professional', 'Mysterious'],
    type: 'mood'
  },
  {
    question: "What pacing do you prefer?",
    options: ['Fast-paced', 'Slow & Deliberate', 'Moderate', 'Dynamic'],
    type: 'pacing'
  }
]

export function ChatStep({ onConceptSelected, selectedConcept, onProceedToScenes, initialPrompt, onBack }: ChatStepProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [currentConcept, setCurrentConcept] = useState<Concept | null>(null)
  const [conversationStage, setConversationStage] = useState<'initial' | 'clarifying' | 'concepts'>('initial')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isGeneratingConcepts, setIsGeneratingConcepts] = useState(false)
  const [showChips, setShowChips] = useState(false)
  const [currentOptions, setCurrentOptions] = useState<string[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentConcept])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [messages.length])

  useEffect(() => {
    if (initialPrompt && messages.length === 0) {
      const userMessage: Message = { role: 'user', content: initialPrompt }
      setMessages([userMessage])

      setIsGeneratingConcepts(true)

      setTimeout(() => {
        const firstQuestion = clarifyingQuestions[0]
        const aiMessage: Message = {
          role: 'assistant',
          content: firstQuestion.question,
          options: firstQuestion.options,
          questionType: firstQuestion.type
        }
        setMessages(prev => [...prev, aiMessage])
        setConversationStage('clarifying')
        
        setShowChips(true)
        setCurrentOptions(firstQuestion.options)
        
        setTimeout(() => {
          setCurrentConcept(generateMockConcept())
          setIsGeneratingConcepts(false)
          onConceptSelected(generateMockConcept())
        }, 1200)
      }, 1000)
    }
  }, [initialPrompt])

  const generateMockConcept = () => {
    const mockConcept: Concept = {
      id: '1',
      title: 'Peaceful Nights, Happy Days',
      description: `# Peaceful Nights, Happy Days

## Ad Concept Overview
A heartwarming 30-second video ad that showcases how our premium baby diapers transform chaotic nighttime routines into peaceful moments, allowing parents and babies to sleep soundly through the night.

## Visual Style
Soft, warm lighting with a cozy home atmosphere. Cinematic shots that feel intimate and relatable. Color palette of soft blues, warm whites, and gentle pastels.

## Key Scenes
1. **Opening (0-5s)**: Tired parent checking on restless baby at night
2. **Transition (5-15s)**: Morning scene showing happy, well-rested baby in our diaper
3. **Product Demo (15-22s)**: Close-ups highlighting 12-hour protection and breathable materials
4. **Closing (22-30s)**: Happy family moment with product branding and tagline

## Target Emotion
Relief, trust, and joy. Parents should feel understood and offered a real solution.

## Tagline
"Because every night should be a peaceful one."`,
      thumbnail: '/happy-baby-playing-with-toys-in-nursery.jpg'
    }
    return mockConcept
  }

  const handleChipSelect = (option: string) => {
    setShowChips(false)
    setCurrentOptions([])
    
    const userMessage: Message = { role: 'user', content: option }
    setMessages(prev => [...prev, userMessage])

    setIsGeneratingConcepts(true)
    setCurrentConcept(null)

    setTimeout(() => {
      if (currentQuestionIndex < clarifyingQuestions.length - 1) {
        const nextQuestion = clarifyingQuestions[currentQuestionIndex + 1]
        const aiMessage: Message = {
          role: 'assistant',
          content: nextQuestion.question,
          options: nextQuestion.options,
          questionType: nextQuestion.type
        }
        setMessages(prev => [...prev, aiMessage])
        setCurrentQuestionIndex(prev => prev + 1)
        
        setShowChips(true)
        setCurrentOptions(nextQuestion.options)
        
        setTimeout(() => {
          setCurrentConcept(generateMockConcept())
          setIsGeneratingConcepts(false)
          onConceptSelected(generateMockConcept())
        }, 1200)
      } else {
        const aiMessage: Message = {
          role: 'assistant',
          content: "Perfect! Based on your preferences, here's your refined ad concept."
        }
        setMessages(prev => [...prev, aiMessage])
        setConversationStage('concepts')
        
        setTimeout(() => {
          setCurrentConcept(generateMockConcept())
          setIsGeneratingConcepts(false)
          onConceptSelected(generateMockConcept())
        }, 1200)
      }
    }, 800)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setShowChips(false)
    setCurrentOptions([])

    const userMessage: Message = { role: 'user', content: input }
    setMessages([...messages, userMessage])
    setInput('')

    setIsGeneratingConcepts(true)
    setCurrentConcept(null)

    setTimeout(() => {
      if (conversationStage === 'initial') {
        const firstQuestion = clarifyingQuestions[0]
        const aiMessage: Message = {
          role: 'assistant',
          content: firstQuestion.question,
          options: firstQuestion.options,
          questionType: firstQuestion.type
        }
        setMessages(prev => [...prev, aiMessage])
        setConversationStage('clarifying')
        
        setShowChips(true)
        setCurrentOptions(firstQuestion.options)
        
        setTimeout(() => {
          setCurrentConcept(generateMockConcept())
          setIsGeneratingConcepts(false)
          onConceptSelected(generateMockConcept())
        }, 1200)
      } else if (conversationStage === 'clarifying') {
        if (currentQuestionIndex < clarifyingQuestions.length - 1) {
          const nextQuestion = clarifyingQuestions[currentQuestionIndex + 1]
          const aiMessage: Message = {
            role: 'assistant',
            content: nextQuestion.question,
            options: nextQuestion.options,
            questionType: nextQuestion.type
          }
          setMessages(prev => [...prev, aiMessage])
          setCurrentQuestionIndex(prev => prev + 1)
          
          setShowChips(true)
          setCurrentOptions(nextQuestion.options)
          
          setTimeout(() => {
            setCurrentConcept(generateMockConcept())
            setIsGeneratingConcepts(false)
            onConceptSelected(generateMockConcept())
          }, 1200)
        } else {
          const aiMessage: Message = {
            role: 'assistant',
            content: "Perfect! Based on your preferences, here's your refined ad concept."
          }
          setMessages(prev => [...prev, aiMessage])
          setConversationStage('concepts')
          
          setTimeout(() => {
            setCurrentConcept(generateMockConcept())
            setIsGeneratingConcepts(false)
            onConceptSelected(generateMockConcept())
          }, 1200)
        }
      }
    }, 1000)
  }

  const handleNext = () => {
    if (!selectedConcept) return
    
    const mockScenes: Scene[] = [
      {
        id: '1',
        description: 'Opening shot: Happy baby playing with colorful toys in a bright, clean nursery with soft natural lighting',
        thumbnail: '/happy-baby-playing-with-toys-in-nursery.jpg'
      },
      {
        id: '2',
        description: 'Mid-section: Parent changing baby\'s diaper with our product, baby smiling and laughing, showing ease of use',
        thumbnail: '/parent-changing-baby-diaper-smiling.jpg'
      },
      {
        id: '3',
        description: 'Closing: Product close-up with key features highlighted, followed by brand logo and tagline overlay',
        thumbnail: '/baby-product-close-up-with-features.jpg'
      }
    ]

    const mockCharacters: Character[] = [
      {
        id: '1',
        name: 'Main Character',
        image: '/professional-person-character.jpg'
      },
      {
        id: '2',
        name: 'Product',
        image: '/modern-product-design.png'
      }
    ]

    onProceedToScenes(mockScenes, mockCharacters)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim()) {
        handleSubmit(e as any)
      }
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className={`flex flex-col transition-all duration-300 ${currentConcept || isGeneratingConcepts || selectedConcept ? 'w-1/2' : 'w-full'}`}>
          <div className={`flex-1 overflow-y-auto px-6 ${messages.length === 0 ? '' : 'py-8'}`}>
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center">
                <div className="w-full max-w-3xl space-y-8">
                  <div className="flex flex-col items-center gap-4 text-center pt-12">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-accent/10">
                      <Sparkles className="size-8 text-accent" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold text-foreground">Create Your Video Ad</h2>
                      <p className="text-muted-foreground max-w-md text-balance">
                        Describe the ad you want to create. Be as detailed or minimal as you'd like.
                      </p>
                    </div>
                  </div>
                
                  <form onSubmit={handleSubmit} className="w-full pb-4">
                    <div className="relative">
                      <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe your ad idea..."
                        className="min-h-[120px] resize-none pr-12 text-base"
                        autoFocus
                      />
                      <Button
                        type="submit"
                        size="icon"
                        className="absolute bottom-3 right-3 size-9"
                        disabled={!input.trim()}
                      >
                        <Send className="size-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-6">
                {messages.map((message, i) => (
                  <div key={i}>
                    <div
                      className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent">
                          <Sparkles className="size-4 text-accent-foreground" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-card-foreground'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                      </div>
                      {message.role === 'user' && (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                          <div className="size-5 rounded-full bg-muted" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {messages.length > 0 && (
            <div className="border-t border-border px-6 py-4">
              {showChips && currentOptions.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {currentOptions.map((option, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => handleChipSelect(option)}
                      className="rounded-full hover:bg-accent hover:text-accent-foreground"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="min-h-[60px] resize-none pr-12 text-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute bottom-2 right-2 size-8"
                  disabled={!input.trim()}
                >
                  <Send className="size-3.5" />
                </Button>
              </form>
            </div>
          )}
        </div>

        {(currentConcept || isGeneratingConcepts || selectedConcept) && (
          <div className="w-1/2 border-l border-border flex flex-col max-h-full">
            {isGeneratingConcepts ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
                <Loader2 className="size-8 animate-spin text-accent" />
                <p className="text-sm text-muted-foreground">Generating concept...</p>
              </div>
            ) : selectedConcept ? (
              <>
                <div className="flex-1 overflow-y-auto">
                  <ConceptEditor concept={selectedConcept} />
                </div>
                <div className="border-t border-border px-6 py-4 bg-background">
                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      onClick={onBack} 
                      size="lg" 
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleNext} 
                      size="lg" 
                      className="flex-1"
                    >
                      Next: Configure Scenes
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
