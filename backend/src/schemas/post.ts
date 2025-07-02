import { z } from 'zod'
import { Platform, Pillar, Status } from '@prisma/client'

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  platform: z.nativeEnum(Platform).optional(),
  pillar: z.nativeEnum(Pillar).optional(),
  publishDate: z.coerce.date(),
  status: z.nativeEnum(Status).optional().default(Status.Scheduled),
  imageUrl: z.string().url().optional().or(z.literal('')),
  assigneeId: z.string().optional()
})

export const updatePostSchema = createPostSchema.partial()

export const postQuerySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1')),
  limit: z.string().optional().transform(val => parseInt(val || '20')),
  platform: z.nativeEnum(Platform).optional(),
  pillar: z.nativeEnum(Pillar).optional(),
  status: z.nativeEnum(Status).optional(),
  assigneeId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  day: z.string().optional()
})

export const bulkActionSchema = z.object({
  postIds: z.array(z.string()).min(1),
  action: z.enum(['delete', 'publish', 'draft', 'reschedule']),
  data: z.object({
    publishDate: z.string().datetime().optional(),
    assigneeId: z.string().optional()
  }).optional()
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type PostQueryInput = z.infer<typeof postQuerySchema>
export type BulkActionInput = z.infer<typeof bulkActionSchema>