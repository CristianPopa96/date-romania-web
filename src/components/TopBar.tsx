import { Link as RouterLink } from '@tanstack/react-router'
import { BarChartIcon } from '@radix-ui/react-icons'
import { Box, Container, Flex, Link, Text } from '@radix-ui/themes'

import { useI18n } from '#/i18n/context'
import { SITE_NAME } from '#/lib/copy'

export function TopBar() {
  const { t } = useI18n()
  return (
    <Box style={{ borderBottom: '1px solid var(--gray-a5)' }}>
      <Container size="3" px="5" py="3">
        <Flex justify="between" align="center" gap="4">
          <Link asChild underline="none" highContrast>
            <RouterLink to="/">
              <Text size="4" weight="bold">
                {SITE_NAME}
              </Text>
            </RouterLink>
          </Link>
          <Link asChild>
            <RouterLink to="/clasamente">
              <Flex align="center" gap="1">
                <BarChartIcon />
                {t.nav.rankings}
              </Flex>
            </RouterLink>
          </Link>
        </Flex>
      </Container>
    </Box>
  )
}
