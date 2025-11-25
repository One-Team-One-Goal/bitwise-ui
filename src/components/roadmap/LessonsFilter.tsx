import { Badge } from '@/components/ui/badge'
import { LayoutGrid, List } from 'lucide-react'

interface LessonsFilterProps {
  totalCount: number
  statusFilter: string
  viewMode: 'grid' | 'list'
  onStatusFilterChange: (status: string) => void
  onViewModeChange: (mode: 'grid' | 'list') => void
}

const STATUS_OPTIONS = ['All Status', 'Not Started', 'In Progress', 'Completed']

export function LessonsFilter({
  totalCount,
  statusFilter,
  viewMode,
  onStatusFilterChange,
  onViewModeChange,
}: LessonsFilterProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            All Lessons
          </h2>
          <Badge variant="secondary" className="rounded-md px-2.5">
            {totalCount}
          </Badge>
        </div>
      </div>

      {/* Controls: Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => onStatusFilterChange(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* View Toggle - Tab Style */}
        <div className="inline-flex h-9 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400 shrink-0">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 ${
              viewMode === 'grid'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-950 dark:text-gray-50'
                : 'hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 ml-1 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 ${
              viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-950 dark:text-gray-50'
                : 'hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
