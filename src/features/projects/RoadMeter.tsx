import { Box, Flex, Text, VisuallyHidden } from '@radix-ui/themes'

import type { ProjectItem, Reach } from '#/features/projects/api'
import { useI18n } from '#/i18n/context'

// How many of the road's seven steps each last step reached fills: the first four
// (funder, programme, financing contract, beneficiary) are what every programme publishes.
const FILLED: Record<Reach, number> = {
  beneficiary: 4,
  payments: 5,
  purchases: 6,
  companies: 7,
}
// The step a gap names: the payments are the fifth.
const GAP_STEP = 4

// "Drum urmărit": a small road of seven segments, filled up to the last step followed, with
// the words under it. A step we cannot follow is an amber outlined segment. A reading aid,
// never a score: no colour says good or bad.
export function RoadMeter({ project }: { project: ProjectItem }) {
  const { t } = useI18n()
  const p = t.projects
  const filled = FILLED[project.reach]
  return (
    <Flex direction="column" gap="1">
      <Flex gap="1" aria-hidden>
        {p.steps.map((step, index) => {
          const gap = project.gap !== null && index === GAP_STEP
          return (
            <Box
              key={step}
              style={{
                width: 10,
                height: 4,
                borderRadius: 2,
                background: gap
                  ? 'transparent'
                  : index < filled
                    ? 'var(--accent-9)'
                    : 'var(--gray-a5)',
                outline: gap ? '1px solid var(--amber-9)' : undefined,
                outlineOffset: -1,
              }}
            />
          )
        })}
      </Flex>
      <Text size="1" color="gray">
        {p.reach[project.reach]}
      </Text>
      {project.gap ? <VisuallyHidden>{p.roadGap}</VisuallyHidden> : null}
    </Flex>
  )
}
