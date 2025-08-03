import React from 'react'
import { lessons } from '@/utils/data'

const lawsTable = lessons.find(l => l.id === 'boolean-laws')?.pages.find(p => p.title === 'Laws of Boolean Algebra')?.blocks.find(b => b.type === 'table')?.table

interface LawsSidebarProps {
  selectedLawIdx: number
  onSelect: (idx: number) => void
}

const LawsSidebar: React.FC<LawsSidebarProps> = ({ selectedLawIdx, onSelect }) => {
  return (
    <aside className="min-w-[220px] h-full overflow-y-auto absolute right-0 top-40">
      <ul className="w-full">
        {lawsTable?.rows.map(([name], idx) => (
          <li key={idx}>
            <button
              className={`w-full p-2 px-3 text-xs rounded-l-md text-left hover:text-black ${
                selectedLawIdx === idx
                  ? 'font-medium bg-[var(--color-bluez)]/10 text-black'
                  : 'text-muted-foreground'
              }`}
              onClick={() => onSelect(idx)}
            >{name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default LawsSidebar
