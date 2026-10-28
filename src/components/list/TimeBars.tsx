import { useI18n } from '#/i18n/context'
import { isOpen, ticks } from '#/lib/list'

export type TimePoint = { start: string; value: number }

const WIDTH = 560
const HEIGHT = 150
const LEFT = 64
const TOP = 18
const BOTTOM = 20

// Bars over time, a month or a day each (ChartCard "În timp"). A month or day not over on
// the newest day held is outlined; the chosen one is the strong colour; clicking a bar
// asks for it as the period of the list. The largest bar carries its value.
export function TimeBars({
  points,
  step,
  lastHeld,
  chosen,
  onPick,
}: {
  points: Array<TimePoint>
  step: 'month' | 'day'
  lastHeld: string | null
  chosen: string | null
  onPick: (start: string) => void
}) {
  const { f, t } = useI18n()
  const largest = Math.max(...points.map((point) => point.value), 0)
  const axis = ticks(largest)
  const top = Math.max(axis.at(-1) ?? 0, largest, 1)
  const inner = HEIGHT - TOP - BOTTOM
  const slot = (WIDTH - LEFT) / Math.max(points.length, 1)
  const bar = Math.max(Math.min(slot * 0.7, 40), 2)
  const y = (value: number) => TOP + inner - (value / top) * inner
  // Every label when they fit; else one in so many.
  const every = Math.ceil(points.length / 12)
  const label = (start: string) =>
    step === 'month' ? f.monthShort(start) : start.slice(8)
  const name = (start: string) =>
    step === 'month' ? f.month(start) : f.day(start)
  const peak = points.findIndex(
    (point) => point.value === largest && largest > 0,
  )

  return (
    <svg
      className="dr-chart"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="group"
      aria-label={t.list.chart.clickHint}
    >
      {axis.map((tick) => (
        <g key={tick}>
          <line
            className="grid"
            x1={LEFT}
            x2={WIDTH}
            y1={y(tick)}
            y2={y(tick)}
          />
          <text x={LEFT - 6} y={y(tick) + 4} textAnchor="end">
            {f.leiShort(tick)}
          </text>
        </g>
      ))}
      {points.map((point, index) => {
        const x = LEFT + index * slot + (slot - bar) / 2
        const height = Math.max(
          inner - (y(point.value) - TOP),
          point.value ? 1 : 0,
        )
        const open = isOpen(point.start, step, lastHeld)
        const on = point.start === chosen
        const pick = () => onPick(point.start)
        return (
          <g key={point.start}>
            <rect
              className={`bar${on ? ' on' : ''}${open ? ' open' : ''}`}
              x={x}
              y={open && height < 2 ? TOP + inner - 2 : TOP + inner - height}
              width={bar}
              height={open ? Math.max(height, 2) : height}
              rx={2}
              tabIndex={0}
              role="button"
              aria-label={`${name(point.start)}: ${f.lei(point.value)}`}
              onClick={pick}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  pick()
                }
              }}
            >
              <title>{`${name(point.start)}: ${f.lei(point.value)}`}</title>
            </rect>
            {index === peak ? (
              <text
                className="on"
                x={x + bar / 2}
                y={y(point.value) - 5}
                textAnchor="middle"
              >
                {f.leiShort(point.value)}
              </text>
            ) : null}
            {index % every === 0 ? (
              <text
                className={on ? 'on' : undefined}
                x={x + bar / 2}
                y={HEIGHT - 5}
                textAnchor="middle"
              >
                {label(point.start)}
              </text>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}
