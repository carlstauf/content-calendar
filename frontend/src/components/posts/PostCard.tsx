import { format } from 'date-fns'
import { Post } from '@/types'
import { cn, getPlatformColor, formatTime } from '@/lib/utils'
import { ClockIcon, UserIcon, ChatBubbleLeftIcon, PhotoIcon } from '@heroicons/react/24/outline'

interface PostCardProps {
  post: Post
  onClick: () => void
  compact?: boolean
}

export default function PostCard({ post, onClick, compact = false }: PostCardProps) {
  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-colors group"
      >
        <div className="flex items-start space-x-2">
          <div className={cn('w-1 h-full rounded-full', getPlatformColor(post.platform))} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-600 leading-tight">
              {post.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(post.publishDate)}
            </p>
          </div>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left card p-4 hover:border-primary-600 transition-colors group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors leading-tight">
            {post.title}
          </h4>
          <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span className={cn('px-2 py-0.5 rounded-full text-white', getPlatformColor(post.platform))}>
              {post.platform}
            </span>
            <span>{post.pillar}</span>
          </div>
        </div>
        
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            post.status === 'Published' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            post.status === 'Scheduled' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            post.status === 'Draft' && 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          )}
        >
          {post.status}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
        {post.description.replace(/<[^>]*>/g, '')}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <ClockIcon className="h-4 w-4" />
            <span>{formatTime(post.publishDate)}</span>
          </div>
          
          {post.assignee && (
            <div className="flex items-center space-x-1">
              <UserIcon className="h-4 w-4" />
              <span>{post.assignee.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {post._count?.comments && post._count.comments > 0 && (
            <div className="flex items-center space-x-1">
              <ChatBubbleLeftIcon className="h-4 w-4" />
              <span>{post._count.comments}</span>
            </div>
          )}
          
          {post.imageUrl && <PhotoIcon className="h-4 w-4" />}
        </div>
      </div>
    </button>
  )
}