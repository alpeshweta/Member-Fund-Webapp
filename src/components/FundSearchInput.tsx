import type { KeyboardEvent } from 'react'

interface Props {
  query: string
  isOpen: boolean
  listboxId: string
  activeItemId: string | null
  disabled: boolean
  onChange: (value: string) => void
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
}

export function FundSearchInput({
  query,
  isOpen,
  listboxId,
  activeItemId,
  disabled,
  onChange,
  onKeyDown,
}: Props) {
  return (
    <div className="relative">
      <label htmlFor="fund-search" className="sr-only">
        Search for your MySuper fund
      </label>
      <input
        id="fund-search"
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeItemId ?? undefined}
        aria-label="Search for your MySuper fund"
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Start typing your super fund name…"
        className={`w-full min-h-[44px] px-4 py-2.5 text-sm text-slate-800 bg-white border border-slate-300 rounded-md shadow-sm
          placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed`}
      />
    </div>
  )
}
