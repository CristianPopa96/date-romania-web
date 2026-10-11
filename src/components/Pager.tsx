import { Button, Flex, Text } from '@radix-ui/themes'

import { useI18n } from '#/i18n/context'

// "Înapoi · Pagina 2 din 7 · Înainte" under a list; nothing for a list of one page.
export function Pager({
  page,
  pages,
  onPage,
}: {
  page: number
  pages: number
  onPage: (page: number) => void
}) {
  const { t, f } = useI18n()
  if (pages <= 1) return null
  return (
    <Flex justify="between" align="center">
      <Button
        variant="soft"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        {t.common.back}
      </Button>
      <Text size="2" color="gray">
        {t.common.page(f.count(page), f.count(pages))}
      </Text>
      <Button
        variant="soft"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
      >
        {t.common.forward}
      </Button>
    </Flex>
  )
}
