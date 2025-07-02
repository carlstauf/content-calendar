export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'viewer'
  avatarUrl?: string
}

export interface Post {
  id: string
  title: string
  description: string
  platform?: Platform
  pillar?: Pillar
  publishDate: string
  status: Status
  imageUrl?: string
  assigneeId?: string
  assignee?: User
  createdAt: string
  updatedAt: string
  _count?: {
    comments: number
    attachments: number
  }
}

export interface Comment {
  id: string
  content: string
  postId: string
  authorId: string
  author: User
  createdAt: string
  updatedAt: string
  mentions?: Mention[]
}

export interface Mention {
  id: string
  commentId: string
  userId: string
  user: User
}

export type Platform = 'TikTok' | 'X' | 'LinkedIn' | 'Instagram'
export type Pillar = 'Life_at_a_Startup' | 'How_to_Build_and_Run_a_Startup' | 'Industry_Insights' | 'Product_Updates'
export type Status = 'Draft' | 'Scheduled' | 'Published'

export interface PostFilters {
  platform?: Platform
  pillar?: Pillar
  status?: Status
  assigneeId?: string
  startDate?: string
  endDate?: string
  day?: string
}

export interface PaginatedResponse<T> {
  posts: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}