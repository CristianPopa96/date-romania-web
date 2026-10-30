import type { ReactNode } from 'react'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { Box, Callout, Card, Flex, Grid, Heading, Text } from '@radix-ui/themes'

import { TraceChain, TraceLegend } from '#/components/TraceChain'
import type { TraceHop, TraceLink } from '#/components/TraceChain'

// The parts every project page (ScreenProject) is built from, top to bottom: the header,
// the figures card, "Drumul banilor", sections with a line beside their heading, and what
// is not public. Each programme's page fills them with its own figures and words.

export function ProjectHeader({
  crumbs,
  eyebrow,
  title,
}: {
  // "Proiecte / Anghel Saligny / Proiectul 101": links built by the page.
  crumbs: ReactNode
  eyebrow: string
  title: string
}) {
  return (
    <Flex direction="column" gap="2">
      <Text size="2" color="gray">
        {crumbs}
      </Text>
      <Text size="1" color="gray" weight="medium">
        {eyebrow}
      </Text>
      <Heading size="7">{title}</Heading>
    </Flex>
  )
}

export type ProjectFigure = {
  label: string
  value: ReactNode
  // Its own period or day: every figure names it.
  note?: ReactNode
}

// Four figures of the programme's own in one row, then one line of facts ("Beneficiar ·
// Stare · Termen"). Each figure names its own day or period.
export function FiguresCard({
  figures,
  facts,
}: {
  figures: Array<ProjectFigure>
  facts: Array<{ label: string; value: ReactNode } | null>
}) {
  const shown = facts.filter((fact) => fact !== null)
  return (
    <Card size="3">
      <Flex direction="column" gap="4">
        <Grid columns={{ initial: '1', xs: '2', md: '4' }} gap="4">
          {figures.map((figure) => (
            <Flex key={figure.label} direction="column" gap="1">
              <Text size="1" color="gray">
                {figure.label}
              </Text>
              <Text
                size="6"
                weight="bold"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {figure.value}
              </Text>
              {figure.note ? (
                <Text size="1" color="gray">
                  {figure.note}
                </Text>
              ) : null}
            </Flex>
          ))}
        </Grid>
        {shown.length ? (
          <Flex gap="2" wrap="wrap" align="center">
            {shown.map((fact, index) => (
              <Text key={fact.label} size="2" color="gray">
                {index > 0 ? '· ' : null}
                {fact.label}{' '}
                <Text color={undefined} highContrast>
                  {fact.value}
                </Text>
              </Text>
            ))}
          </Flex>
        ) : null}
      </Flex>
    </Card>
  )
}

// "Drumul banilor": the chain and its key, under the heading and the line beside it.
export function MoneyRoad({
  title,
  lead,
  hops,
  label,
  legend,
}: {
  title: string
  lead: string
  hops: Array<TraceHop>
  label: string
  // The words of each kind of line; only the kinds drawn are listed.
  legend: Record<TraceLink, string>
}) {
  const drawn = new Set(hops.map((hop) => hop.link?.kind))
  const order: Array<TraceLink> = [
    'published',
    'probable',
    'possible',
    'unknown',
    'gap',
  ]
  return (
    <Card size="3">
      <Flex direction="column" gap="4">
        <ProjectSectionHeading title={title} aside={lead} as="h2" />
        <TraceChain hops={hops} label={label} />
        <TraceLegend
          items={order
            .filter((kind) => drawn.has(kind))
            .map((kind) => ({ kind, label: legend[kind] }))}
        />
      </Flex>
    </Card>
  )
}

// A section's heading with the line beside it that says how its rows were found.
export function ProjectSectionHeading({
  title,
  aside,
  as = 'h2',
}: {
  title: string
  aside?: ReactNode
  as?: 'h2' | 'h3'
}) {
  return (
    <Flex justify="between" align="baseline" gap="3" wrap="wrap">
      <Heading as={as} size={as === 'h2' ? '5' : '4'}>
        {title}
      </Heading>
      {aside ? (
        <Text size="1" color="gray">
          {aside}
        </Text>
      ) : null}
    </Flex>
  )
}

// "Ce nu este public": amber, with no request link until the request flow exists.
export function NotPublic({ title, text }: { title: string; text: string }) {
  return (
    <Flex direction="column" gap="3">
      <ProjectSectionHeading title={title} />
      <Callout.Root color="amber" variant="surface" size="1">
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>{text}</Callout.Text>
      </Callout.Root>
    </Flex>
  )
}

export function ProjectSources({ children }: { children: ReactNode }) {
  return (
    <Box>
      <Flex direction="column" gap="1">
        {children}
      </Flex>
    </Box>
  )
}
