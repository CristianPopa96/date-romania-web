import { useState } from 'react'
import { Badge, Button, Flex, Heading, Switch, Text } from '@radix-ui/themes'

import { Unavailable } from '#/components/Notes'
import { Arrow, Item, Step } from '#/features/sources/RoadStep'
import { useI18n } from '#/i18n/context'
import type { DataRoad as Road, Dataset } from '#/features/sources/api'
import {
  LANES,
  PAGES,
  gigabytes,
  laneSources,
  onLane,
  ruleCounts,
} from '#/features/sources/road'
import type { Lane } from '#/features/sources/road'

// How a public source becomes a page, in five steps, with the figures of now. A lane
// (one family of sources) lights its own path; the details switch adds, under every
// item, the names a technical reader can check in the code.
export function DataRoad({
  road,
  datasets,
}: {
  road: Road | 'failed'
  datasets: Array<Dataset>
}) {
  const { t, f } = useI18n()
  const r = t.road
  const [lane, setLane] = useState<Lane | null>(null)
  const [tech, setTech] = useState(false)
  if (road === 'failed') return <Unavailable />

  const sources = laneSources(datasets)
  const rules = ruleCounts(road.links)
  const projects = road.projects.reduce((sum, each) => sum + each.count, 0)
  const rows = road.read.reduce((sum, each) => sum + each.count, 0)
  const s = r.steps

  return (
    <Flex direction="column" gap="5">
      <Flex direction="column" gap="2">
        <Heading size="5">{r.title}</Heading>
        <Text size="2" color="gray" style={{ maxWidth: '70ch' }}>
          {r.lead}
        </Text>
      </Flex>

      <Flex gap="3" align="center" wrap="wrap" justify="between">
        <Flex
          gap="2"
          align="center"
          wrap="wrap"
          role="group"
          aria-label={r.lanes}
        >
          <Text size="2" color="gray">
            {r.lanes}
          </Text>
          {[null, ...LANES].map((each) => (
            <Button
              key={each ?? 'all'}
              size="1"
              variant={lane === each ? 'solid' : 'soft'}
              color={lane === each ? undefined : 'gray'}
              aria-pressed={lane === each}
              onClick={() => setLane(each)}
            >
              {each ? r.lane[each] : r.all}
            </Button>
          ))}
        </Flex>
        <Text as="label" size="2">
          <Flex gap="2" align="center">
            <Switch size="1" checked={tech} onCheckedChange={setTech} />
            {r.techSwitch}
          </Flex>
        </Text>
      </Flex>

      <Flex
        direction={{ initial: 'column', md: 'row' }}
        gap="2"
        align="stretch"
      >
        <Step
          n={1}
          title={s.sources.title}
          text={s.sources.text}
          tech={tech && s.sources.tech}
          figure={s.sources.count(sources.length, f.count(sources.length))}
        >
          {sources.map((each) => (
            <Item
              key={each.key}
              lit={onLane(lane, 'sources', each.key)}
              tech={tech ? `${each.key} · ${f.count(each.documents)}` : null}
            >
              {t.datasets.name(
                each.publisher,
                t.datasets.names[each.key] ?? each.key,
              )}
            </Item>
          ))}
        </Step>
        <Arrow />
        <Step
          n={2}
          title={s.kept.title}
          text={s.kept.text}
          tech={tech && s.kept.tech}
          figure={s.kept.count(road.documents, f.count(road.documents))}
        >
          <Item lit>
            {s.kept.size(f.quantity(gigabytes(road.stored_bytes)))}
          </Item>
        </Step>
        <Arrow />
        <Step
          n={3}
          title={s.read.title}
          text={s.read.text}
          tech={tech && s.read.tech}
          figure={s.read.count(rows, f.count(rows))}
        >
          <Item lit>
            {s.read.rejected(road.rejected_rows, f.count(road.rejected_rows))}
          </Item>
          {road.read.map((each) => (
            <Item
              key={each.key}
              lit={onLane(lane, 'tables', each.key)}
              tech={tech ? each.key : null}
            >
              {f.count(each.count)} {r.tables[each.key] ?? each.key}
            </Item>
          ))}
          <Item lit={onLane(lane, 'tables', 'register_company')}>
            {s.read.skipped}
          </Item>
        </Step>
        <Arrow />
        <Step
          n={4}
          title={s.linked.title}
          text={s.linked.text}
          tech={tech && s.linked.tech}
        >
          {rules.map((rule) => (
            <Item
              key={rule.rule}
              lit={onLane(lane, 'rules', rule.rule)}
              tech={
                tech
                  ? rule.methods
                      .map((m) => `${m.method} ${f.count(m.count)}`)
                      .join(' · ')
                  : null
              }
            >
              <Flex direction="column" gap="1">
                <Text>{r.rules[rule.rule] ?? rule.rule}</Text>
                <Flex gap="1" wrap="wrap">
                  {rule.facts > 0 ? (
                    <Badge color="gray">{f.count(rule.facts)}</Badge>
                  ) : null}
                  {(['sure', 'probable', 'possible'] as const).map((level) =>
                    rule.byConfidence[level] ? (
                      <Badge
                        key={level}
                        color={
                          level === 'sure'
                            ? 'green'
                            : level === 'probable'
                              ? 'amber'
                              : 'orange'
                        }
                      >
                        {f.count(rule.byConfidence[level])} {s.linked[level]}
                      </Badge>
                    ) : null,
                  )}
                </Flex>
                {r.factNote[rule.rule] ? (
                  <Text size="1" color="gray">
                    {r.factNote[rule.rule]}
                  </Text>
                ) : null}
              </Flex>
            </Item>
          ))}
        </Step>
        <Arrow />
        <Step
          n={5}
          title={s.shown.title}
          text={s.shown.text}
          tech={tech && s.shown.tech}
          figure={s.shown.projects(projects, f.count(projects))}
        >
          <Item lit>
            {s.shown.entities(road.entities, f.count(road.entities))}
          </Item>
          {PAGES.map((page) => (
            <Item key={page} lit={onLane(lane, 'pages', page)}>
              {r.pages[page]}
            </Item>
          ))}
        </Step>
      </Flex>

      <Flex direction="column" gap="2">
        <Heading size="3">{r.reachTitle}</Heading>
        <Flex gap="2" wrap="wrap">
          {road.reach.map((each) => (
            <Badge key={each.key} color="gray" size="2">
              {f.count(each.count)} {r.reach[each.key] ?? each.key}
            </Badge>
          ))}
        </Flex>
      </Flex>
    </Flex>
  )
}
