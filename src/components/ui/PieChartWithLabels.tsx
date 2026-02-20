import { useRef, useEffect, useState, useCallback } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/utils/format'

interface PieChartWithLabelsProps {
  data: { name: string; color: string; total: number }[]
  total: number
  currency: string
}

interface LabelPos {
  x: number
  y: number
  text: string
}

export function PieChartWithLabels({ data, total, currency }: PieChartWithLabelsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [labels, setLabels] = useState<LabelPos[]>([])

  const computeLabels = useCallback(() => {
    const el = containerRef.current
    if (!el || total === 0) return

    const sectors = el.querySelectorAll('.recharts-pie-sector path')
    if (sectors.length === 0) return

    const newLabels: LabelPos[] = []
    sectors.forEach((path) => {
      const cx = Number(path.getAttribute('cx'))
      const cy = Number(path.getAttribute('cy'))
      const d = path.getAttribute('d')
      if (!d || !cx || !cy) return

      const mMatch = d.match(/M\s+([\d.]+),([\d.]+)/)
      const aMatch = d.match(/A\s+[\d.]+,[\d.]+,\d+,\s*\d+,\d+,\s*([\d.-]+),([\d.-]+)/)
      if (!mMatch || !aMatch) return

      const startX = Number(mMatch[1])
      const startY = Number(mMatch[2])
      const endX = Number(aMatch[1])
      const endY = Number(aMatch[2])

      const startAngle = Math.atan2(-(startY - cy), startX - cx)
      const endAngle = Math.atan2(-(endY - cy), endX - cx)

      let mid = (startAngle + endAngle) / 2
      if (Math.abs(startAngle - endAngle) > Math.PI) {
        mid += Math.PI
      }

      const labelRadius = (60 + 100) / 2
      const lx = cx + labelRadius * Math.cos(mid)
      const ly = cy - labelRadius * Math.sin(mid)

      const name = path.getAttribute('name') || ''
      const entry = data.find((d) => d.name === name)
      if (!entry) return
      const pct = Math.round((entry.total / total) * 100)
      if (pct < 5) return

      newLabels.push({ x: lx, y: ly, text: `${pct}%` })
    })

    setLabels(newLabels)
  }, [data, total])

  useEffect(() => {
    const timer = setTimeout(computeLabels, 50)
    return () => clearTimeout(timer)
  }, [computeLabels])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new MutationObserver(() => setTimeout(computeLabels, 100))
    observer.observe(el, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [computeLabels])

  return (
    <div ref={containerRef} className="relative" style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            dataKey="total"
            nameKey="name"
            paddingAngle={2}
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => {
              const pct = total > 0 ? ((Number(value) / total) * 100).toFixed(1) : '0'
              return `${formatCurrency(Number(value), currency)} (${pct}%)`
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      {labels.map((label, i) => (
        <span
          key={i}
          className="pointer-events-none absolute text-xs font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
          style={{
            left: label.x,
            top: label.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {label.text}
        </span>
      ))}
    </div>
  )
}
