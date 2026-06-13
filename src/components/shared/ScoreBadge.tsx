import { formatScore } from '@/lib/formatters'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  const variant = score >= 16 ? 'success' : score >= 12 ? 'warning' : 'danger'
  return (
    <Badge variant={variant} className={cn('font-mono', className)}>
      {formatScore(score)}
    </Badge>
  )
}
