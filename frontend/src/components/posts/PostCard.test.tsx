import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PostCard from './PostCard'
import { Post } from '@/types'

const mockPost: Post = {
  id: '1',
  title: 'Test Post',
  description: '<p>Test description</p>',
  platform: 'LinkedIn',
  pillar: 'ProductUpdates',
  publishDate: '2024-01-15T10:00:00Z',
  status: 'Scheduled',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  assignee: {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'editor',
  },
  _count: {
    comments: 5,
    attachments: 2,
  },
}

describe('PostCard', () => {
  it('renders post information correctly', () => {
    const onClick = vi.fn()
    render(<PostCard post={mockPost} onClick={onClick} />)

    expect(screen.getByText('Test Post')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByText('LinkedIn')).toBeInTheDocument()
    expect(screen.getByText('ProductUpdates')).toBeInTheDocument()
    expect(screen.getByText('Scheduled')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<PostCard post={mockPost} onClick={onClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders compact version correctly', () => {
    const onClick = vi.fn()
    render(<PostCard post={mockPost} onClick={onClick} compact />)

    expect(screen.getByText('Test Post')).toBeInTheDocument()
    expect(screen.queryByText('Test description')).not.toBeInTheDocument()
  })

  it('displays photo icon when image is present', () => {
    const postWithImage = { ...mockPost, imageUrl: 'https://example.com/image.jpg' }
    render(<PostCard post={postWithImage} onClick={vi.fn()} />)

    const container = screen.getByRole('button')
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})