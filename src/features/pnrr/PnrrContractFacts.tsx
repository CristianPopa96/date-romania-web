import { Link as RouterLink } from '@tanstack/react-router'
import {
  Card,
  Code,
  DataList,
  Flex,
  Link,
  Progress,
  Text,
} from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { EntityLink, roleOfKind } from '#/components/EntityLink'
import { PnrrStatusBadge } from '#/features/pnrr/PnrrTables'
import { useI18n } from '#/i18n/context'
import type { PnrrContract } from '#/features/pnrr/api'
import { measureLabel, measureSlug } from '#/features/pnrr/pnrr'

// The ministry's own progress figures, as given; never worked out from the payments. A
// contract whose measures disagree shows one row per measure (design Q53, proposed).
export function ProgressBars({ contract }: { contract: PnrrContract }) {
  const { t, f } = useI18n()
  const p = t.pnrr
  const ministry = contract.ministry
  const percent = (value: number | null) =>
    value === null ? t.common.notPublished : f.percent(value)

  if (!contract.measures_differ) {
    return (
      <Flex direction="column" gap="3">
        <Bar
          label={p.progressPhysical}
          value={contract.physical_progress}
          note={p.reportedBy(ministry)}
        />
        <Bar
          label={p.progressFinancial}
          value={contract.financial_progress}
          note={p.reportedByDiffers(ministry)}
        />
      </Flex>
    )
  }
  return (
    <Flex direction="column" gap="2">
      <Text size="2" weight="medium">
        {p.progressByMeasure}
      </Text>
      {contract.lines.map((line) => (
        <Flex
          key={`${line.measure}-${line.funding}`}
          justify="between"
          gap="3"
          wrap="wrap"
        >
          <Text size="2">{measureLabel(line.measure, line.measure_name)}</Text>
          <Text size="2" color="gray">
            {p.progressRow(
              percent(line.physical_progress),
              percent(line.financial_progress),
            )}
          </Text>
        </Flex>
      ))}
      <Text size="1" color="gray">
        {p.reportedByDiffers(ministry)}
      </Text>
    </Flex>
  )
}

function Bar({
  label,
  value,
  note,
}: {
  label: string
  value: number | null
  note: string
}) {
  const { t, f } = useI18n()
  return (
    <Flex direction="column" gap="1">
      <Flex justify="between">
        <Text size="2">{label}</Text>
        <Text size="2">
          {value === null ? t.common.notPublished : f.percent(value)}
        </Text>
      </Flex>
      {value === null ? null : (
        <Progress value={Math.round(value * 100)} aria-label={label} />
      )}
      <Text size="1" color="gray">
        {note}
      </Text>
    </Flex>
  )
}

export function Facts({
  contract,
  measures,
}: {
  contract: PnrrContract
  measures: Array<string>
}) {
  const { t, f } = useI18n()
  const p = t.pnrr
  const fundings = [
    ...new Set(contract.lines.map((line) => line.funding).filter(Boolean)),
  ]

  return (
    <Card size="3">
      <DataList.Root
        size="2"
        orientation={{ initial: 'vertical', sm: 'horizontal' }}
      >
        <DataList.Item>
          <DataList.Label>{p.number}</DataList.Label>
          <DataList.Value>
            {contract.number ? (
              <Code variant="ghost">{contract.number}</Code>
            ) : (
              <DataState kind="notPublished" />
            )}
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>{p.beneficiary}</DataList.Label>
          <DataList.Value>
            {contract.beneficiary ? (
              <Text>
                <EntityLink
                  role={roleOfKind(contract.beneficiary.kind)}
                  cui={contract.beneficiary.cui}
                >
                  {contract.beneficiary.name}
                </EntityLink>{' '}
                <Code variant="ghost" color="gray">
                  CUI {contract.beneficiary.cui}
                </Code>
              </Text>
            ) : (
              <DataState kind="notPublished" />
            )}
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>{p.measures}</DataList.Label>
          <DataList.Value>
            <Flex direction="column" gap="1">
              {contract.lines.map((line, index) => (
                <Flex
                  key={`${line.measure}-${line.funding}`}
                  gap="2"
                  align="center"
                  wrap="wrap"
                >
                  <Link asChild>
                    <RouterLink
                      to="/programe/pnrr/$masura"
                      params={{ masura: measureSlug(line.measure) }}
                    >
                      {measures[index]}
                    </RouterLink>
                  </Link>
                  {/* Each measure's own status, when they differ. */}
                  {contract.measures_differ && line.status ? (
                    <PnrrStatusBadge status={line.status} />
                  ) : null}
                </Flex>
              ))}
            </Flex>
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>{p.ministry}</DataList.Label>
          <DataList.Value>
            {contract.ministry_name ?? contract.ministry}
          </DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label>{p.funding}</DataList.Label>
          <DataList.Value>
            {fundings
              .map((each) => (each && p.fundings[each]) ?? each)
              .join(', ') || <DataState kind="notPublished" />}
          </DataList.Value>
        </DataList.Item>
        {contract.status ? (
          <DataList.Item>
            <DataList.Label>{p.state}</DataList.Label>
            <DataList.Value>
              <PnrrStatusBadge status={contract.status} />
            </DataList.Value>
          </DataList.Item>
        ) : null}
        <DataList.Item>
          <DataList.Label>{p.ends}</DataList.Label>
          <DataList.Value>
            {contract.ends_on ? (
              f.day(contract.ends_on)
            ) : (
              <DataState kind="notPublished" />
            )}
          </DataList.Value>
        </DataList.Item>
      </DataList.Root>
    </Card>
  )
}
