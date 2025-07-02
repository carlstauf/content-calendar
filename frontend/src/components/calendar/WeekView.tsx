import { useMemo } from 'react'
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
} from 'date-fns'
import { usePosts } from '@/hooks/usePosts'
import { Post, PostFilters } from '@/types'
import { cn } from '@/lib/utils'
import PostCard from '../posts/PostCard'

interface WeekViewProps {
  currentDate: Date
  filters: PostFilters
  onEditPost: (post: Post) => void
}

export default function WeekView({ currentDate, filters, onEditPost }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate)
  const weekEnd = endOfWeek(currentDate)

  const days = useMemo(
    () => eachDayOfInterval({ start: weekStart, end: weekEnd }),
    [weekStart, weekEnd]
  )

  const { data, isLoading } = usePosts({
    ...filters,
    startDate: weekStart.toISOString(),
    endDate: weekEnd.toISOString(),
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="card p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading week view...</p>
      </div>
    )
  }

  // Check if there are any posts for the week
  const hasAnyPosts = data?.posts && data.posts.length > 0

  return (
    <div className="card overflow-hidden relative">
      <div className="grid grid-cols-7 gap-4 p-4">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayPosts = postsByDate.get(dateKey) || []
          const isCurrentDay = isToday(day)

          return (
            <div key={dateKey} className="space-y-2">
              <div
                className={cn(
                  'text-center pb-2 border-b border-gray-200 dark:border-gray-700',
                  isCurrentDay && 'border-primary-600'
                )}
              >
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {format(day, 'EEE')}
                </p>
                <p
                  className={cn(
                    'text-lg font-semibold',
                    isCurrentDay && 'text-primary-600'
                  )}
                >
                  {format(day, 'd')}
                </p>
              </div>

              <div className="space-y-2 min-h-[400px]">
                {dayPosts.length > 0 ? (
                  dayPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onClick={() => onEditPost(post)}
                      compact
                    />
                  ))
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
                    No posts
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
              No posts scheduled this week
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start planning your content for the week of {format(weekStart, 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}