import { useState } from 'react'
import { format } from 'date-fns'
import { usePosts, useBulkAction } from '@/hooks/usePosts'
import { Post, PostFilters } from '@/types'
import { cn, formatPillarLabel } from '@/lib/utils'
import { TrashIcon, CheckIcon, ClockIcon } from '@heroicons/react/24/outline'

interface ListViewProps {
  filters: PostFilters
  onEditPost: (post: Post) => void
}

export default function ListView({ filters, onEditPost }: ListViewProps) {
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  
  const { data, isLoading } = usePosts({
    ...filters,
    page,
    limit: 20,
  })

  const bulkAction = useBulkAction()

  const toggleSelect = (postId: string) => {
    const newSelected = new Set(selectedPosts)
    if (newSelected.has(postId)) {
      newSelected.delete(postId)
    } else {
      newSelected.add(postId)
    }
    setSelectedPosts(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedPosts.size === (data?.posts?.length || 0)) {
      setSelectedPosts(new Set())
    } else {
      setSelectedPosts(new Set(data?.posts?.map((p) => p.id) || []))
    }
  }

  const handleBulkAction = async (action: 'delete' | 'publish' | 'draft') => {
    if (selectedPosts.size === 0) return
    
    await bulkAction.mutateAsync({
      postIds: Array.from(selectedPosts),
      action,
    })
    
    setSelectedPosts(new Set())
  }

  if (isLoading) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">Loading posts...</p>
      </div>
    )
  }

  if (!data?.posts.length) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">No posts found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {selectedPosts.size > 0 && (
        <div className="card p-4 flex items-center justify-between animate-slide-down">
          <p className="text-sm font-medium">
            {selectedPosts.size} post{selectedPosts.size !== 1 ? 's' : ''} selected
          </p>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleBulkAction('publish')}
              className="btn btn-sm btn-secondary flex items-center space-x-1"
            >
              <CheckIcon className="h-4 w-4" />
              <span>Publish</span>
            </button>
            
            <button
              onClick={() => handleBulkAction('draft')}
              className="btn btn-sm btn-secondary flex items-center space-x-1"
            >
              <ClockIcon className="h-4 w-4" />
              <span>Draft</span>
            </button>
            
            <button
              onClick={() => handleBulkAction('delete')}
              className="btn btn-sm btn-secondary flex items-center space-x-1 text-red-600 hover:text-red-700"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedPosts.size === (data?.posts?.length || 0)}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Platform
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pillar
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Publish Date
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Assignee
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.posts?.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedPosts.has(post.id)}
                      onChange={() => toggleSelect(post.id)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => onEditPost(post)}
                      className="text-left hover:text-primary-600 transition-colors"
                    >
                      <p className="font-medium">{post.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {post.description.replace(/<[^>]*>/g, '')}
                      </p>
                    </button>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{post.platform || '-'}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{formatPillarLabel(post.pillar) || '-'}</span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm">{format(new Date(post.publishDate), 'MMM d, yyyy')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(post.publishDate), 'h:mm a')}
                    </p>
                  </td>
                  <td className="p-4">
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
                  </td>
                  <td className="p-4">
                    {post.assignee && (
                      <div className="flex items-center space-x-2">
                        {post.assignee.avatarUrl ? (
                          <img
                            src={post.assignee.avatarUrl}
                            alt={post.assignee.name}
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-white">
                            {post.assignee.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm">{post.assignee.name}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, data.pagination.total)} of{' '}
              {data.pagination.total} results
            </p>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn btn-sm btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === data.pagination.pages}
                className="btn btn-sm btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}