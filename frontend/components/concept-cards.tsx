import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'
import type { Concept } from '@/app/page'
import Image from 'next/image'

type ConceptCardsProps = {
  concepts: Concept[]
  selectedConcept: Concept | null
  onSelect: (concept: Concept) => void
}

export function ConceptCards({ concepts, selectedConcept, onSelect }: ConceptCardsProps) {
  return (
    <div className="flex flex-col gap-4">
      {concepts.map((concept) => {
        const isSelected = selectedConcept?.id === concept.id
        return (
          <Card
            key={concept.id}
            className={`relative cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-accent ${
              isSelected ? 'ring-2 ring-accent' : ''
            }`}
            onClick={() => onSelect(concept)}
          >
            <div className="flex gap-4">
              <div className="h-32 w-48 shrink-0 overflow-hidden bg-muted">
                <Image
                  src={concept.thumbnail || "/placeholder.svg"}
                  alt={concept.title}
                  width={192}
                  height={128}
                  className="size-full object-cover"
                />
              </div>
              <div className="flex flex-1 items-start justify-between gap-4 p-4">
                <div className="flex-1 max-h-24 overflow-y-auto">
                  <h3 className="font-semibold text-card-foreground">{concept.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{concept.description}</p>
                </div>
                {isSelected && (
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent">
                    <Check className="size-3 text-accent-foreground" />
                  </div>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
