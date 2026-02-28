import { useUIStore } from '@/stores/ui-store'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

const fontSizeMap = {
  small: { label: 'Small', value: 0 },
  medium: { label: 'Medium', value: 1 },
  large: { label: 'Large', value: 2 },
  xlarge: { label: 'Extra Large', value: 3 },
} as const

const valueToSize = ['small', 'medium', 'large', 'xlarge'] as const

export function FontSizeSlider() {
  const { fontSize, setFontSize } = useUIStore()
  const currentValue = fontSizeMap[fontSize].value

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Font Size</Label>
        <span className="text-xs text-muted-foreground">
          {fontSizeMap[fontSize].label}
        </span>
      </div>
      <Slider
        value={[currentValue]}
        min={0}
        max={3}
        step={1}
        onValueChange={([v]) => setFontSize(valueToSize[v])}
        className="w-full"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>A</span>
        <span className="text-base">A</span>
      </div>
    </div>
  )
}
