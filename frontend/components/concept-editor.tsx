'use client'

import { useState, useRef } from 'react'
import { FileText, Bold, Italic, List, ListOrdered, Heading, Code } from 'lucide-react'
import type { Concept } from '@/app/page'
import ReactMarkdown from 'react-markdown'

type ConceptEditorProps = {
  concept: Concept
}

export function ConceptEditor({ concept }: ConceptEditorProps) {
  const [markdown, setMarkdown] = useState(`# ${concept.title}

## Overview
${concept.description}

## Key Elements
- Visual style: Modern and clean
- Color palette: Professional with brand colors
- Pacing: Smooth and engaging
- Duration: 30 seconds

## Scenes Breakdown
1. **Opening Hook** - Capture attention immediately
2. **Product Showcase** - Highlight key features
3. **Call to Action** - Drive engagement

## Target Audience
- Age: 25-45
- Interests: Technology, innovation
- Values: Quality and efficiency

## Music & Sound
- Background: Upbeat and motivational
- Voiceover: Professional and friendly
- Sound effects: Subtle and polished`)

  const contentRef = useRef<HTMLDivElement>(null)

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = contentRef.current?.innerHTML || ''
    const fullText = tempDiv.innerText

    const start = fullText.indexOf(selectedText)
    if (start === -1) return

    const end = start + selectedText.length
    const newMarkdown =
      markdown.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      markdown.substring(end)

    setMarkdown(newMarkdown)
  }

  const handleContentChange = () => {
    if (contentRef.current) {
      const newContent = contentRef.current.innerText
      setMarkdown(newContent)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-border px-6 py-4">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="size-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Concept Details</h2>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={() => insertFormatting('**', '**')}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            title="Bold"
          >
            <Bold className="size-4" />
          </button>
          <button
            onClick={() => insertFormatting('*', '*')}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            title="Italic"
          >
            <Italic className="size-4" />
          </button>
          <button
            onClick={() => insertFormatting('## ', '')}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            title="Heading"
          >
            <Heading className="size-4" />
          </button>
          <button
            onClick={() => insertFormatting('- ', '')}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            title="Bullet List"
          >
            <List className="size-4" />
          </button>
          <button
            onClick={() => insertFormatting('1. ', '')}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            title="Numbered List"
          >
            <ListOrdered className="size-4" />
          </button>
          <button
            onClick={() => insertFormatting('`', '`')}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            title="Code"
          >
            <Code className="size-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[calc(100vh-280px)] overflow-y-auto p-6">
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentChange}
          className="prose prose-invert max-w-none min-h-[400px] outline-none focus:outline-none"
        >
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
