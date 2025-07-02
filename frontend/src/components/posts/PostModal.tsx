import { Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useForm, Controller } from 'react-hook-form'
import { format } from 'date-fns'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useCreatePost, useUpdatePost } from '@/hooks/usePosts'
import { Post, Platform, Pillar, Status } from '@/types'
import { useAuthStore } from '@/stores/auth'
import RichTextEditor from '../editor/RichTextEditor'

interface PostModalProps {
  isOpen: boolean
  onClose: () => void
  post?: Post | null
  defaultDate?: Date | null
}

interface PostForm {
  title: string
  description: string
  platform?: Platform
  pillar?: Pillar
  publishDate: string
  status?: Status
  imageUrl?: string
  assigneeId?: string
}

export default function PostModal({ isOpen, onClose, post, defaultDate }: PostModalProps) {
  const { user } = useAuthStore()
  const createPost = useCreatePost()
  const updatePost = useUpdatePost()
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PostForm>({
    defaultValues: {
      status: 'Scheduled',
      assigneeId: user?.id,
    },
  })

  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        description: post.description,
        platform: post.platform,
        pillar: post.pillar,
        publishDate: format(new Date(post.publishDate), "yyyy-MM-dd'T'HH:mm"),
        status: post.status,
        imageUrl: post.imageUrl,
        assigneeId: post.assigneeId,
      })
    } else if (defaultDate) {
      reset({
        publishDate: format(defaultDate, "yyyy-MM-dd'T'HH:mm"),
        status: 'Scheduled',
        assigneeId: user?.id,
      })
    }
  }, [post, defaultDate, reset, user])

  const onSubmit = async (data: PostForm) => {
    // Format data for API
    const formattedData = {
      ...data,
      description: data.description, // Ensure description is passed as-is
      publishDate: new Date(data.publishDate).toISOString(),
      imageUrl: data.imageUrl?.trim() || undefined,
      // Convert empty strings to undefined so they're not sent
      platform: data.platform || undefined,
      pillar: data.pillar || undefined,
      status: data.status || undefined
    }

    if (post) {
      await updatePost.mutateAsync({ id: post.id, ...formattedData })
    } else {
      await createPost.mutateAsync(formattedData)
    }
    onClose()
    reset()
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-md bg-white dark:bg-gray-800 text-left border-2 border-gray-300 dark:border-gray-700 transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                        {post ? 'Edit Post' : 'Create New Post'}
                      </Dialog.Title>
                      <button
                        type="button"
                        className="rounded-md text-gray-400 hover:text-gray-500"
                        onClick={onClose}
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="title" className="label">
                          Title
                        </label>
                        <input
                          id="title"
                          type="text"
                          className="input mt-1"
                          {...register('title', { required: 'Title is required' })}
                        />
                        {errors.title && (
                          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="label">Description</label>
                        <Controller
                          name="description"
                          control={control}
                          rules={{ required: 'Description is required' }}
                          render={({ field }) => (
                            <RichTextEditor
                              value={field.value}
                              onChange={field.onChange}
                            />
                          )}
                        />
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="platform" className="label">
                            Platform
                          </label>
                          <select
                            id="platform"
                            className="input mt-1"
                            {...register('platform')}
                          >
                            <option value="">No platform selected</option>
                            <option value="TikTok">TikTok</option>
                            <option value="X">X</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Instagram">Instagram</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="pillar" className="label">
                            Pillar
                          </label>
                          <select
                            id="pillar"
                            className="input mt-1"
                            {...register('pillar')}
                          >
                            <option value="">No pillar selected</option>
                            <option value="Life_at_a_Startup">Life at a Startup</option>
                            <option value="How_to_Build_and_Run_a_Startup">How to Build and Run a Startup</option>
                            <option value="Industry_Insights">Industry Insights</option>
                            <option value="Product_Updates">Product Updates</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="publishDate" className="label">
                            Publish Date & Time
                          </label>
                          <input
                            id="publishDate"
                            type="datetime-local"
                            className="input mt-1"
                            {...register('publishDate', { required: 'Publish date is required' })}
                          />
                          {errors.publishDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.publishDate.message}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="status" className="label">
                            Status
                          </label>
                          <select
                            id="status"
                            className="input mt-1"
                            {...register('status')}
                          >
                            <option value="">Default (Scheduled)</option>
                            <option value="Draft">Draft</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Published">Published</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="imageUrl" className="label">
                          Image URL (optional)
                        </label>
                        <input
                          id="imageUrl"
                          type="url"
                          className="input mt-1"
                          {...register('imageUrl')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="submit"
                      disabled={createPost.isPending || updatePost.isPending}
                      className="w-full sm:w-auto btn btn-primary btn-md sm:ml-3"
                    >
                      {createPost.isPending || updatePost.isPending
                        ? 'Saving...'
                        : post
                        ? 'Update Post'
                        : 'Create Post'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-3 w-full sm:w-auto btn btn-secondary btn-md sm:mt-0"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}