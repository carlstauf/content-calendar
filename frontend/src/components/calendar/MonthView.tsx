import { useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { usePosts } from '@/hooks/usePosts'
import { Post, PostFilters } from '@/types'
import { cn, getPlatformColor } from '@/lib/utils'
import { useUIStore } from '@/stores/ui'

interface MonthViewProps {
  currentDate: Date
  filters: PostFilters
  onEditPost: (post: Post) => void
}

export default function MonthView({ currentDate, filters, onEditPost }: MonthViewProps) {
  const { setDrawerOpen, setSelectedDate } = useUIStore()
  const queryClient = useQueryClient()
  
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarStart, calendarEnd]
  )

  const { data, isLoading } = usePosts({
    ...filters,
    startDate: calendarStart.toISOString(),
    endDate: calendarEnd.toISOString(),
    limit: 100,
  })

  const postsByDate = useMemo(() => {
    const map = new Map<string, Post[]>()
    
    if (data?.posts) {
      data.posts.forEach((post) => {
        const dateKey = format(new Date(post.publishDate), 'yyyy-MM-dd')
        const existing = map.get(dateKey) || []
        map.set(dateKey, [...existing, post])
      })
    }
    
    return map
  }, [data?.posts])

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setDrawerOpen(true)
    queryClient.invalidateQueries({ queryKey: ['posts', date.toISOString().slice(0,10)] })
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="card p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading calendar...</p>
      </div>
    )
  }

  // Check if there are any posts for the entire month
  const hasAnyPosts = data?.posts && data.posts.length > 0

  return (
    <div className="card overflow-hidden relative">
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="bg-gray-50 dark:bg-gray-800 px-2 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayPosts = postsByDate.get(dateKey) || []
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isCurrentDay = isToday(day)

          return (
            <div
              key={dateKey}
              onClick={() => handleDayClick(day)}
              className={cn(
                'min-h-[120px] bg-white dark:bg-gray-800 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                !isCurrentMonth && 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'text-sm font-medium',
                    isCurrentDay && 'bg-primary-600 text-white px-2 py-0.5 rounded-full'
                  )}
                >
                  {format(day, 'd')}
                </span>
                {dayPosts.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {dayPosts.length}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {dayPosts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditPost(post)
                    }}
                    className="group"
                  >
                    <div className="flex items-center space-x-1">
                      <div className={cn('w-2 h-2 rounded-full', getPlatformColor(post.platform))} />
                      <p className="text-xs truncate group-hover:text-primary-600 transition-colors">
                        {post.title}
                      </p>
                    </div>
                  </div>
                ))}
                {dayPosts.length > 3 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 pl-3">
                    +{dayPosts.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty state overlay */}
      {!hasAnyPosts && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No posts scheduled
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click on any day to create your first post for {format(currentDate, 'MMMM yyyy')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}