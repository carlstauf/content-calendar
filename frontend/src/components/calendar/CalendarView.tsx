import { Post, PostFilters } from '@/types'
import MonthView from './MonthView'
import WeekView from './WeekView'
import ListView from './ListView'

interface CalendarViewProps {
  view: 'month' | 'week' | 'list'
  currentDate: Date
  filters: PostFilters
  onEditPost: (post: Post) => void
}

export default function CalendarView({
  view,
  currentDate,
  filters,
  onEditPost,
}: CalendarViewProps) {
  switch (view) {
    case 'month':
      return (
        <MonthView
          currentDate={currentDate}
          filters={filters}
          onEditPost={onEditPost}
        />
      )
    case 'week':
      return (
        <WeekView
          currentDate={currentDate}
          filters={filters}
          onEditPost={onEditPost}
        />
      )
    case 'list':
      return (
        <ListView
          currentDate={currentDate}
          filters={filters}
          onEditPost={onEditPost}
        />
      )
  }
}