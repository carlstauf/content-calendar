import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date))
}

export function getPlatformColor(platform: string) {
  const colors = {
    TikTok: 'bg-pink-500',
    X: 'bg-gray-900',
    LinkedIn: 'bg-blue-600',
    Instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
  }
  return colors[platform as keyof typeof colors] || 'bg-gray-500'
}

export function getPillarColor(pillar: string) {
  const colors = {
    Life: 'bg-green-500',
    StartupRun: 'bg-orange-500',
    IndustryInsights: 'bg-blue-500',
    ProductUpdates: 'bg-purple-500',
  }
  return colors[pillar as keyof typeof colors] || 'bg-gray-500'
}