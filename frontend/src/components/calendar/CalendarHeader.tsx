import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline'
import { format, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns'
import { PostFilters, Platform, Pillar, Status } from '@/types'
import { cn } from '@/lib/utils'

interface CalendarHeaderProps {
  view: 'month' | 'week' | 'list'
  setView: (view: 'month' | 'week' | 'list') => void
  currentDate: Date
  setCurrentDate: (date: Date) => void
  filters: PostFilters
  setFilters: (filters: PostFilters) => void
  onCreatePost: () => void
}

export default function CalendarHeader({
  view,
  setView,
  currentDate,
  setCurrentDate,
  filters,
  setFilters,
  onCreatePost,
}: CalendarHeaderProps) {
  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(subWeeks(currentDate, 1))
    }
  }

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1))
    } else {
      setCurrentDate(addWeeks(currentDate, 1))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h1>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Previous"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleToday}
              className="px-3 py-1 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Today
            </button>
            
            <button
              onClick={handleNext}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Next"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
            {(['month', 'week', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-4 py-2 text-sm font-medium capitalize transition-colors',
                  view === v
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                {v}
              </button>
            ))}
          </div>

          <button
            onClick={onCreatePost}
            className="btn btn-primary btn-md flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Post</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4 overflow-x-auto pb-2">
        <select
          value={filters.platform || ''}
          onChange={(e) =>
            setFilters({ ...filters, platform: e.target.value as Platform || undefined })
          }
          className="input py-1.5 text-sm"
        >
          <option value="">All Platforms</option>
          <option value="TikTok">TikTok</option>
          <option value="X">X</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Instagram">Instagram</option>
        </select>

        <select
          value={filters.pillar || ''}
          onChange={(e) =>
            setFilters({ ...filters, pillar: e.target.value as Pillar || undefined })
          }
          className="input py-1.5 text-sm"
        >
          <option value="">All Pillars</option>
          <option value="Life">Life</option>
          <option value="StartupRun">Startup Run</option>
          <option value="IndustryInsights">Industry Insights</option>
          <option value="ProductUpdates">Product Updates</option>
        </select>

        <select
          value={filters.status || ''}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value as Status || undefined })
          }
          className="input py-1.5 text-sm"
        >
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Published">Published</option>
        </select>

        {Object.keys(filters).length > 0 && (
          <button
            onClick={() => setFilters({})}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}