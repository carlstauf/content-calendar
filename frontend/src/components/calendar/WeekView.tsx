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

  const { data } = usePosts({
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

  return (
    <div className="card overflow-hidden">
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
                {dayPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onClick={() => onEditPost(post)}
                    compact
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}