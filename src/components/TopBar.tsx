import { Link as RouterLink, useRouterState } from '@tanstack/react-router'
import { BarChartIcon } from '@radix-ui/react-icons'
import { Box, Container, Flex, Link, Text } from '@radix-ui/themes'

import { SearchBox } from '#/components/SearchBox'
import { useI18n } from '#/i18n/context'
import { SITE_NAME } from '#/lib/copy'

// On every page: the logo, the sections that exist, and a compact search. A section
// joins the bar when its page ships, never as a placeholder. The search field is the way
// in to search, so there is no "Caută" item next to it.
export function TopBar() {
  const { t } = useI18n()
  const path = useRouterState({ select: (state) => state.location.pathname })
  // On the home page the large search box is the page.
  const home = path === '/'

  return (
    <Box asChild style={{ borderBottom: '1px solid var(--gray-a5)' }}>
      <header>
        <Container size="4" px="5" py="3">
          <Flex align="center" gap="5" wrap="wrap">
            <Link asChild underline="none" highContrast>
              <RouterLink to="/">
                <Text size="4" weight="bold">
                  {SITE_NAME}
                </Text>
              </RouterLink>
            </Link>
            <Flex asChild gap="4" align="center" flexGrow="1">
              <nav aria-label={t.nav.label}>
                <Link
                  asChild
                  color={path === '/clasamente' ? undefined : 'gray'}
                >
                  <RouterLink
                    to="/clasamente"
                    aria-current={path === '/clasamente' ? 'page' : undefined}
                  >
                    <Flex align="center" gap="1">
                      <BarChartIcon />
                      {t.nav.rankings}
                    </Flex>
                  </RouterLink>
                </Link>
              </nav>
            </Flex>
            {/* The key empties the field once a search has been sent. */}
            {home ? null : <SearchBox key={path} compact />}
          </Flex>
        </Container>
      </header>
    </Box>
  )
}
