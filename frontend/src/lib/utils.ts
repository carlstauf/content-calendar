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

export function getPlatformColor(platform: string | undefined) {
  if (!platform) return 'bg-gray-500'
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
    Life_at_a_Startup: 'bg-green-500',
    How_to_Build_and_Run_a_Startup: 'bg-orange-500',
    Industry_Insights: 'bg-blue-500',
    Product_Updates: 'bg-purple-500',
  }
  return colors[pillar as keyof typeof colors] || 'bg-gray-500'
}

export function formatPillarLabel(pillar: string | undefined): string {
  if (!pillar) return ''
  
  const labels: Record<string, string> = {
    Life_at_a_Startup: 'Life at a Startup',
    How_to_Build_and_Run_a_Startup: 'How to Build and Run a Startup',
    Industry_Insights: 'Industry Insights',
    Product_Updates: 'Product Updates',
  }
  
  return labels[pillar] || pillar
}