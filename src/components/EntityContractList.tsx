import { useSuspenseQuery } from '@tanstack/react-query'
import { DownloadIcon } from '@radix-ui/react-icons'
import { Button, Flex, Text } from '@radix-ui/themes'

import { ContractTable } from '#/components/ContractTable'
import { Pager } from '#/components/Pager'
import { useI18n } from '#/i18n/context'
import { PAGE_SIZE } from '#/lib/api'
import type { Role } from '#/lib/api'
import { contractsQuery } from '#/lib/queries'
import { contractsCsvPath } from '#/lib/urls'

// The contracts an institution awarded or a company won, among those signed in the
// period we hold: newest first, a page at a time, with the whole list as a CSV file.
export function EntityContractList({
  role,
  cui,
  page,
  onPage,
}: {
  role: Role
  cui: number
  page: number
  onPage: (page: number) => void
}) {
  const { t, f } = useI18n()
  const { data } = useSuspenseQuery(contractsQuery(role, cui, page))
  const pages = Math.max(Math.ceil(data.total / PAGE_SIZE), 1)

  if (data.total === 0) {
    const days =
      data.period && f.span(data.period.first_day, data.period.last_day)
    return (
      <Text size="2" color="gray">
        {days
          ? t.contracts.none(t.period.range(days.from, days.to))
          : t.rankings.none}
      </Text>
    )
  }

  return (
    <Flex direction="column" gap="3">
      <Flex justify="end">
        <Button asChild variant="soft" color="gray" size="1">
          {/* A plain link: the file is written by the server, not by the page. */}
          <a
            href={contractsCsvPath(
              role === 'institutions' ? { buyer: cui } : { supplier: cui },
            )}
            download
          >
            <DownloadIcon />
            {t.contracts.export}
          </a>
        </Button>
      </Flex>
      <ContractTable contracts={data.items} view={role} />
      <Pager page={page} pages={pages} onPage={onPage} />
    </Flex>
  )
}
