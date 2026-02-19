import * as LucideIcons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Pencil, Trash2 } from 'lucide-react'
import type { Category } from '@/types/database'

interface CategoryCardProps {
  category: Category
  expenseCount: number
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

function getCategoryIcon(iconName: string) {
  const pascalCase = iconName
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as any)[pascalCase] as React.ComponentType<{ className?: string; style?: React.CSSProperties }> | undefined
  return Icon || LucideIcons.CircleDot
}

export function CategoryCard({ category, expenseCount, onEdit, onDelete }: CategoryCardProps) {
  const Icon = getCategoryIcon(category.icon)
  const hasExpenses = expenseCount > 0

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: category.color + '20' }}
        >
          <Icon className="h-5 w-5" style={{ color: category.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{category.name}</p>
          {category.is_default && (
            <Badge variant="secondary" className="mt-1 text-xs">Default</Badge>
          )}
        </div>
        <div
          className="h-4 w-4 shrink-0 rounded-full border"
          style={{ backgroundColor: category.color }}
        />
        {!category.is_default && (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(category)}>
              <Pencil className="h-4 w-4" />
            </Button>
            {hasExpenses ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Category has {expenseCount} expense{expenseCount !== 1 ? 's' : ''}. Reassign them first.
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(category)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { getCategoryIcon }
