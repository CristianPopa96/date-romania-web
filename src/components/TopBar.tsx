import { Link as RouterLink, useRouterState } from '@tanstack/react-router'
import { BarChartIcon, FileTextIcon, Share2Icon } from '@radix-ui/react-icons'
import { Box, Container, Flex, Link, Text } from '@radix-ui/themes'

import { SearchBox } from '#/components/SearchBox'
import { useI18n } from '#/i18n/context'
import { SITE_NAME } from '#/lib/copy'

// There is no logo yet: the name stands beside a small tile with three bars. The tile
// is decoration; the name is the link's text.
function LogoMark() {
  return (
    <Flex
      align="center"
      justify="center"
      aria-hidden
      style={{
        width: 24,
        height: 24,
        borderRadius: 'var(--radius-2)',
        background: 'var(--accent-9)',
        color: 'var(--accent-contrast)',
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 15 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <path d="M3 12V8M7.5 12V3M12 12V6" />
      </svg>
    </Flex>
  )
}

// A section is open on its own page and on the pages under it.
function isOpen(path: string, section: string) {
  return path === section || path.startsWith(`${section}/`)
}

// On every page: the logo, the sections that exist, and a compact search. A section
// joins the bar when its page ships, never as a placeholder. The search field is the way
// in to search, so there is no "Caută" item next to it.
export function TopBar() {
  const { t } = useI18n()
  const path = useRouterState({ select: (state) => state.location.pathname })
  // The home page and the search page have the large search box; a second field next
  // to it would be the same field twice.
  const ownSearch = path === '/' || path === '/cautare'
  const sections = [
    { to: '/programe', label: t.nav.programmes, icon: <Share2Icon /> },
    { to: '/clasamente', label: t.nav.rankings, icon: <BarChartIcon /> },
    { to: '/surse', label: t.nav.sources, icon: <FileTextIcon /> },
  ] as const

  return (
    <Box asChild style={{ borderBottom: '1px solid var(--gray-a5)' }}>
      <header>
        <Container size="4" px="5" py="3">
          <Flex align="center" gap="5" wrap="wrap">
            <Link asChild underline="none" highContrast>
              <RouterLink to="/">
                <Flex align="center" gap="2">
                  <LogoMark />
                  <Text size="4" weight="bold">
                    {SITE_NAME}
                  </Text>
                </Flex>
              </RouterLink>
            </Link>
            <Flex asChild gap="4" align="center" flexGrow="1">
              <nav aria-label={t.nav.label}>
                {sections.map((section) => (
                  <Link
                    key={section.to}
                    asChild
                    color={isOpen(path, section.to) ? undefined : 'gray'}
                  >
                    <RouterLink
                      to={section.to}
                      aria-current={
                        isOpen(path, section.to) ? 'page' : undefined
                      }
                    >
                      <Flex align="center" gap="1">
                        {section.icon}
                        {section.label}
                      </Flex>
                    </RouterLink>
                  </Link>
                ))}
              </nav>
            </Flex>
            {/* The key empties the field once a search has been sent. */}
            {ownSearch ? null : <SearchBox key={path} compact />}
          </Flex>
        </Container>
      </header>
    </Box>
  )
}
