interface AnalyticsWidgetProps {
  title: string
  value: number | string
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export default function AnalyticsWidget({ title, value, description, trend }: AnalyticsWidgetProps) {
  // Handle null/undefined values gracefully
  const displayValue = value !== null && value !== undefined ? value : 'N/A'
  
  return (
    <div className="card p-4">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {title}
      </p>
      <div className="mt-1 flex items-baseline justify-between">
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
          {displayValue}
        </p>
        {trend && (
          <p
            className={`text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </p>
        )}
      </div>
      {description && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  )
}