import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { format } from 'date-fns'
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useQueryClient } from '@tanstack/react-query'
import { usePosts, usePostAnalytics } from '@/hooks/usePosts'
import { useUIStore } from '@/stores/ui'
import { Post } from '@/types'
import PostCard from '../posts/PostCard'
import AnalyticsWidget from '../analytics/AnalyticsWidget'

interface DayDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  onEditPost: (post: Post) => void
  onCreatePost: (date: Date) => void
}

export default function DayDetailDrawer({
  isOpen,
  onClose,
  onEditPost,
  onCreatePost,
}: DayDetailDrawerProps) {
  const { selectedDate } = useUIStore()
  const { data: analytics } = usePostAnalytics()
  const queryClient = useQueryClient()

  // Query posts for the selected date with optimized cache key
  const { data, isLoading } = usePosts({
    limit: 50,
  }, selectedDate)

  if (!selectedDate) return null

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white dark:bg-gray-800 shadow-xl">
                    <div className="px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                        </Dialog.Title>
                        <button
                          type="button"
                          className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                          onClick={onClose}
                        >
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 sm:px-6">
                      <div className="space-y-6">
                        <button
                          onClick={() => onCreatePost(selectedDate)}
                          className="w-full btn btn-primary btn-md flex items-center justify-center space-x-2"
                        >
                          <PlusIcon className="h-5 w-5" />
                          <span>Add Post for This Day</span>
                        </button>

                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                            Posts ({data?.posts.length || 0})
                          </h3>
                          {isLoading ? (
                            <div className="text-center py-8">
                              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading posts...</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {data?.posts.map((post) => (
                                <div
                                  key={post.id}
                                  className="bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-600 overflow-hidden"
                                >
                                  <PostCard
                                    post={post}
                                    onClick={() => onEditPost(post)}
                                  />
                                </div>
                              ))}
                              {(!data?.posts.length) && (
                                <p className="text-center text-gray-400 py-8">No scheduled posts for this day</p>
                              )}
                            </div>
                          )}
                        </div>

                        {analytics && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                              Analytics Overview
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                              <AnalyticsWidget
                                title="This Month"
                                value={analytics.thisMonth}
                                description="Published posts"
                              />
                              <AnalyticsWidget
                                title="Total Scheduled"
                                value={analytics.byStatus?.Scheduled || 0}
                                description="Upcoming posts"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}