import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { Button, Flex, IconButton, Select, Text } from '@radix-ui/themes'

import { useI18n } from '#/i18n/context'
import { PAGE_SIZES, pageItems, pageRange } from '#/lib/list'
import type { PageSize } from '#/lib/list'

// Under a list (DataTable in the design system): "1–25 din 46", the page numbers, and the
// rows per page. The numbers hide when everything fits on one page; the size stays while
// the list holds more than the smallest page.
export function ListPager({
  page,
  size,
  total,
  onPage,
  onSize,
}: {
  page: number
  size: PageSize
  total: number
  onPage: (page: number) => void
  onSize: (size: PageSize) => void
}) {
  const { t, f } = useI18n()
  const pages = Math.max(Math.ceil(total / size), 1)
  const range = pageRange(page, size, total)
  if (total <= PAGE_SIZES[0]) return null
  return (
    <Flex justify="between" align="center" gap="3" wrap="wrap">
      <Text size="2" color="gray">
        {t.list.pager.range(
          f.count(range.first),
          f.count(range.last),
          f.count(total),
        )}
      </Text>
      {pages > 1 ? (
        <Flex asChild gap="1" align="center">
          <nav aria-label={t.list.pager.label}>
            <IconButton
              variant="ghost"
              color="gray"
              disabled={page <= 1}
              aria-label={t.list.pager.previous}
              onClick={() => onPage(page - 1)}
            >
              <ChevronLeftIcon />
            </IconButton>
            {pageItems(page, pages).map((number, index) =>
              number === null ? (
                <Text
                  key={`gap${index}`}
                  size="2"
                  color="gray"
                  style={{ padding: '0 4px' }}
                >
                  …
                </Text>
              ) : (
                <Button
                  key={number}
                  size="1"
                  variant={number === page ? 'soft' : 'ghost'}
                  color={number === page ? undefined : 'gray'}
                  aria-current={number === page ? 'page' : undefined}
                  aria-label={t.list.pager.page(f.count(number))}
                  onClick={() => onPage(number)}
                >
                  {f.count(number)}
                </Button>
              ),
            )}
            <IconButton
              variant="ghost"
              color="gray"
              disabled={page >= pages}
              aria-label={t.list.pager.next}
              onClick={() => onPage(page + 1)}
            >
              <ChevronRightIcon />
            </IconButton>
          </nav>
        </Flex>
      ) : null}
      <Select.Root
        size="1"
        value={String(size)}
        onValueChange={(value) => onSize(Number(value) as PageSize)}
      >
        <Select.Trigger aria-label={t.list.pager.perPageLabel} />
        <Select.Content>
          {PAGE_SIZES.map((each) => (
            <Select.Item key={each} value={String(each)}>
              {t.list.pager.perPage(each)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Flex>
  )
}
