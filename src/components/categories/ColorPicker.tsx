import { cn } from '@/lib/utils'

const COLORS = [
  '#4CAF50', '#2196F3', '#FF9800', '#9C27B0',
  '#E91E63', '#00BCD4', '#F44336', '#795548',
  '#3F51B5', '#607D8B', '#FF5722', '#8BC34A',
  '#673AB7', '#009688', '#9E9E9E', '#CDDC39',
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className={cn(
            'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
            value === color ? 'border-foreground scale-110' : 'border-transparent'
          )}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
          title={color}
        />
      ))}
    </div>
  )
}
