import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, AlertTriangle, Users, Target } from 'lucide-react'
import type { Insight, InsightIcon, InsightColor } from '@/utils/insights'

const iconMap: Record<InsightIcon, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Target,
}

const colorMap: Record<InsightColor, string> = {
  green: 'text-green-500',
  yellow: 'text-yellow-500',
  red: 'text-red-500',
}

interface InsightsCardProps {
  insights: Insight[]
}

export function InsightsCard({ insights }: InsightsCardProps) {
  if (insights.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => {
          const Icon = iconMap[insight.icon]
          return (
            <div key={insight.id} className="flex items-start gap-3">
              <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${colorMap[insight.color]}`} />
              <div>
                <p className="text-sm font-semibold">{insight.title}</p>
                <p className="text-xs text-muted-foreground">{insight.detail}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
