import { useSuspenseQuery } from '@tanstack/react-query'
import { Link as RouterLink } from '@tanstack/react-router'
import { DownloadIcon, InfoCircledIcon } from '@radix-ui/react-icons'
import { Button, Callout, Flex, Heading, Link, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import type { FilterDecl, Patch } from '#/components/list/filter-types'
import { ListEmpty } from '#/components/list/ListEmpty'
import { ListView } from '#/components/list/ListView'
import { Unavailable } from '#/components/Notes'
import { SourceLine } from '#/components/SourceLine'
import { PairRows } from '#/features/patterns/PairRows'
import { cpvDivisionLabel, ruleLimits } from '#/features/patterns/near-limit'
import { cpvDivisionsQuery, nearLimitQuery } from '#/features/patterns/queries'
import {
  CONTRACT_TYPES,
  PATTERN_COLUMNS,
  contractTypeFromParam,
  patternCsvPath,
  patternSort,
} from '#/features/patterns/urls'
import type { PatternSearch } from '#/features/patterns/urls'
import { useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import type { Messages } from '#/i18n'
import { sortToParam } from '#/lib/list'
import type { Sort } from '#/lib/list'

// The patterns tab: measured facts worth asking documents for, each with its rule, what
// it does and does not mean, and its source. Never an accusation. A pattern's pairs are a
// list of the DataTable pattern; `onApply` writes a change of it to the address.
export function Patterns({
  search,
  onApply,
}: {
  search: PatternSearch
  onApply: (patch: Patch) => void
}) {
  const { t } = useI18n()
  return (
    <Flex direction="column" gap="5">
      <Callout.Root color="gray" variant="surface" size="1">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>{t.rankings.patterns.intro}</Callout.Text>
      </Callout.Root>
      <NearLimit search={search} onApply={onApply} />
      <Later />
    </Flex>
  )
}

function NearLimit({
  search,
  onApply,
}: {
  search: PatternSearch
  onApply: (patch: Patch) => void
}) {
  const { t, f } = useI18n()
  const { data } = useSuspenseQuery(nearLimitQuery(search))
  const { data: divisions } = useSuspenseQuery(cpvDivisionsQuery)
  const words = t.rankings.patterns.nearLimit
  if (!data) return <Unavailable />
  const limits = ruleLimits(data)
  const days = f.period(data.first_day, data.last_day)
  const cpv = search.cpv === undefined ? undefined : String(search.cpv)
  const type = contractTypeFromParam(search.tip)
  // A change of filter or order goes back to the first page.
  const apply = (patch: Patch) => onApply({ ...patch, pagina: undefined })
  const sort = patternSort(search.ordine)
  const onSort = (next: Sort | null) =>
    apply({ ordine: next ? sortToParam(next, PATTERN_COLUMNS) : undefined })
  const filtered = cpv !== undefined || type !== undefined

  return (
    <Flex direction="column" gap="3">
      <Flex direction="column" gap="1">
        <Text size="2">
          {words.rule(
            f.count(data.rule.repeats),
            f.percent(data.rule.share),
            f.lei(limits.goods),
            f.lei(limits.works),
          )}
        </Text>
        <Text size="2" color="gray">
          {words.meaning}
        </Text>
        <Text size="2" color="gray">
          {words.annex2(data.annex_2, f.count(data.annex_2))}
        </Text>
      </Flex>
      <ListView
        title={words.title}
        search={{
          q: undefined,
          what: null,
          filters: patternFilterDecls(cpv, type, divisions ?? [], t),
          onApply: apply,
        }}
        summary={{
          headline: words.pairs(data.pairs, f.count(data.pairs)),
          detail: (
            <>
              {words.checked(
                f.count(data.checked),
                data.accepted_total,
                f.count(data.accepted_total),
              )}
              {data.unknown_type > 0
                ? ` ${words.unknownType(data.unknown_type, f.count(data.unknown_type))}`
                : null}
              {days ? ` ${words.checkedPeriod(days)}` : null}
            </>
          ),
        }}
        views={null}
        file={null}
        sort={{
          value: sort,
          columns: [
            { column: 'achizitii', label: words.purchases },
            { column: 'valoare', label: words.value },
          ],
          isDefault: search.ordine === undefined,
          onSort,
        }}
        charts={null}
        rows={<PairRows items={data.items} sort={sort} onSort={onSort} />}
        empty={
          <ListEmpty
            back={null}
            onClear={
              filtered ? () => apply({ cpv: undefined, tip: undefined }) : null
            }
          />
        }
        pager={{
          page: search.pagina ?? 1,
          size: search.pe_pagina ?? 25,
          total: data.pairs,
          onPage: (page) => onApply({ pagina: page > 1 ? page : undefined }),
          onSize: (next) =>
            apply({ pe_pagina: next === 25 ? undefined : next }),
        }}
      />
      <Flex justify="between" align="center" gap="3" wrap="wrap">
        <Text size="1" color="gray">
          {t.rankings.patterns.observed}
        </Text>
        {/* Every pair, one line per purchase, with the filters of the list. */}
        <Button asChild variant="soft" color="gray" size="1">
          <a href={patternCsvPath(cpv, type)} download>
            <DownloadIcon />
            {t.contracts.export}
          </a>
        </Button>
      </Flex>
      <SourceLine source={data.source} />
    </Flex>
  )
}

// The pattern's filters: CPV and the contract type, one of each at a time. Neither can be
// counted for every option, so their choices carry no counts.
function patternFilterDecls(
  cpv: string | undefined,
  type: number | undefined,
  divisions: ReadonlyArray<{ code: string; name: string | null }>,
  t: Messages,
): Array<FilterDecl> {
  const words = t.rankings.patterns.nearLimit
  // The code in the address stays a choice even when the list could not be read.
  const options =
    cpv === undefined || divisions.some((division) => division.code === cpv)
      ? divisions
      : [...divisions, { code: cpv, name: null }]
  const chosen = options.findIndex((division) => division.code === cpv)
  const types = [...CONTRACT_TYPES]
  return [
    {
      key: 'cpv',
      kind: 'choice',
      single: true,
      label: words.filters.cpv,
      value: chosen >= 0 ? [chosen] : [],
      options: options.map((division, index) => ({
        value: index,
        label: cpvDivisionLabel(division.code, division),
      })),
      chip:
        chosen >= 0
          ? cpvDivisionLabel(options[chosen].code, options[chosen])
          : null,
      clear: { cpv: undefined },
      patch: (next) => ({
        cpv: next.length ? options[next[0]].code : undefined,
      }),
    },
    {
      key: 'tip',
      kind: 'choice',
      single: true,
      label: words.filters.tip,
      value: type === undefined ? [] : [types.indexOf(type as 1 | 2 | 3)],
      options: types.map((each, index) => ({
        value: index,
        label: words.types[each],
      })),
      chip: type === undefined ? null : words.types[type as 1 | 2 | 3],
      clear: { tip: undefined },
      patch: (next) => ({
        tip: next.length ? types[next[0]] : undefined,
      }),
    },
  ]
}

// The other patterns of the flow: why the data held cannot give them yet, or where the
// site shows one outside the rankings.
function Later() {
  const { t } = useI18n()
  const { elsewhere } = t.rankings.patterns
  return (
    <Flex direction="column" gap="2">
      <Heading size="4">{t.rankings.patterns.laterTitle}</Heading>
      {t.rankings.patterns.later.map((pattern) => (
        <Flex key={pattern.title} direction="column" gap="1">
          <Flex gap="2" align="center" wrap="wrap">
            <Text size="2" weight="medium">
              {pattern.title}
            </Text>
            {'notCollected' in pattern ? (
              <DataState kind="notCollected" />
            ) : null}
          </Flex>
          <Text size="2" color="gray">
            {pattern.reason}
          </Text>
        </Flex>
      ))}
      <Flex direction="column" gap="1">
        <Text size="2" weight="medium">
          {elsewhere.title}
        </Text>
        <Text size="2" color="gray">
          {rich(elsewhere.text, {
            programme: (
              <Link key="programme" asChild>
                <RouterLink to="/programe/anghel-saligny">
                  {elsewhere.programme}
                </RouterLink>
              </Link>
            ),
          })}
        </Text>
      </Flex>
    </Flex>
  )
}
