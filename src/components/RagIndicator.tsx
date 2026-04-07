import type { RagColour } from '../types/performance'

interface Props {
  rag: RagColour
}

const DOT_CLASS: Record<NonNullable<RagColour>, string> = {
  Green: 'bg-green-500',
  Amber: 'bg-amber-500',
  Red: 'bg-red-500',
}

/**
 * Renders a coloured dot alongside the RAG label text.
 * Colour is never the sole indicator — the text label always accompanies the dot (WCAG 1.4.1).
 */
export function RagIndicator({ rag }: Props) {
  if (rag === null) return null

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
      <span
        className={`w-2.5 h-2.5 rounded-full shrink-0 ${DOT_CLASS[rag]}`}
        aria-hidden="true"
      />
      <span>{rag}</span>
    </span>
  )
}
