import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Post, PostFilters, PaginatedResponse } from '@/types'
import toast from 'react-hot-toast'

export function usePosts(filters?: PostFilters & { page?: number; limit?: number }, selectedDate?: Date) {
  const dateKey = selectedDate?.toISOString().slice(0,10)
  
  return useQuery({
    queryKey: ['posts', dateKey || filters],
    queryFn: async () => {
      let params = filters || {}
      
      // If selectedDate is provided, filter for that specific day
      if (selectedDate) {
        params = {
          ...params,
          day: dateKey
        }
      }
      
      const { data } = await api.get<PaginatedResponse<Post>>('/posts', {
        params,
      })
      return data
    },
    staleTime: 30_000
  })
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: async () => {
      const { data } = await api.get<Post>(`/posts/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (post: Partial<Post>) => {
      const { data } = await api.post<Post>('/posts', post)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post created successfully')
    },
    onError: () => {
      toast.error('Failed to create post')
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...post }: Partial<Post> & { id: string }) => {
      const { data } = await api.patch<Post>(`/posts/${id}`, post)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post updated successfully')
    },
    onError: () => {
      toast.error('Failed to update post')
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/posts/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete post')
    },
  })
}

export function useBulkAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      postIds,
      action,
      data,
    }: {
      postIds: string[]
      action: 'delete' | 'publish' | 'draft' | 'reschedule'
      data?: { publishDate?: string }
    }) => {
      const response = await api.post('/posts/bulk', { postIds, action, data })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      const actionMessages = {
        delete: 'Posts deleted successfully',
        publish: 'Posts published successfully',
        draft: 'Posts moved to draft',
        reschedule: 'Posts rescheduled successfully',
      }
      toast.success(actionMessages[variables.action])
    },
    onError: () => {
      toast.error('Bulk action failed')
    },
  })
}

export function usePostAnalytics() {
  return useQuery({
    queryKey: ['posts', 'analytics'],
    queryFn: async () => {
      const { data } = await api.get('/posts/analytics/summary')
      return data
    },
  })
}