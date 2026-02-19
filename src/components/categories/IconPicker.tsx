import { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Curated list of icons relevant to expense categories
const ICON_NAMES = [
  'shopping-cart', 'home', 'zap', 'car', 'utensils', 'film', 'heart-pulse',
  'shopping-bag', 'graduation-cap', 'repeat', 'shield', 'sparkles', 'gift',
  'plane', 'ellipsis', 'coffee', 'music', 'book', 'phone', 'wifi',
  'tv', 'camera', 'gamepad-2', 'dumbbell', 'baby', 'dog', 'cat',
  'briefcase', 'hammer', 'wrench', 'scissors', 'palette', 'shirt',
  'glasses', 'bike', 'bus', 'train-front', 'fuel', 'parking-meter',
  'pill', 'stethoscope', 'banknote', 'credit-card', 'piggy-bank',
  'landmark', 'calculator', 'receipt', 'newspaper', 'flower-2',
  'tree-pine', 'umbrella', 'cloud-rain',
]

function getIcon(name: string) {
  const pascalCase = name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (LucideIcons as any)[pascalCase] as React.ComponentType<{ className?: string }> | undefined
}

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = ICON_NAMES.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  )

  const SelectedIcon = value ? getIcon(value) : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          {SelectedIcon ? (
            <>
              <SelectedIcon className="h-4 w-4" />
              <span className="text-sm">{value}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Select an icon</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <Input
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />
        <div className="grid max-h-56 grid-cols-8 gap-1 overflow-y-auto">
          {filtered.map((name) => {
            const Icon = getIcon(name)
            if (!Icon) return null
            return (
              <button
                key={name}
                type="button"
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-accent',
                  value === name && 'bg-primary text-primary-foreground hover:bg-primary'
                )}
                onClick={() => {
                  onChange(name)
                  setOpen(false)
                  setSearch('')
                }}
                title={name}
              >
                <Icon className="h-4 w-4" />
              </button>
            )
          })}
        </div>
        {filtered.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">No icons found</p>
        )}
      </PopoverContent>
    </Popover>
  )
}
