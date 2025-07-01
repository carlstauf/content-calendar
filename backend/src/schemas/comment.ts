import { z } from 'zod'

export const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  postId: z.string()
})

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(1000)
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>