import { useState } from 'react'
import CalendarView from '@/components/calendar/CalendarView'
import CalendarHeader from '@/components/calendar/CalendarHeader'
import DayDetailDrawer from '@/components/calendar/DayDetailDrawer'
import PostModal from '@/components/posts/PostModal'
import { useUIStore } from '@/stores/ui'
import { Post, PostFilters } from '@/types'

export default function Calendar() {
  const [view, setView] = useState<'month' | 'week' | 'list'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filters, setFilters] = useState<PostFilters>({})
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  
  const { isDrawerOpen, setDrawerOpen } = useUIStore()

  const handleCreatePost = (date?: Date) => {
    setEditingPost(null)
    setIsPostModalOpen(true)
  }

  const handleEditPost = (post: Post) => {
    setEditingPost(post)
    setIsPostModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <CalendarHeader
        view={view}
        setView={setView}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        filters={filters}
        setFilters={setFilters}
        onCreatePost={() => handleCreatePost()}
      />

      <CalendarView
        view={view}
        currentDate={currentDate}
        filters={filters}
        onEditPost={handleEditPost}
      />

      <DayDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        onEditPost={handleEditPost}
        onCreatePost={handleCreatePost}
      />

      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        post={editingPost}
        defaultDate={useUIStore.getState().selectedDate}
      />
    </div>
  )
}