import { Link as RouterLink } from '@tanstack/react-router'
import { BarChartIcon } from '@radix-ui/react-icons'
import { Box, Container, Flex, Link, Text } from '@radix-ui/themes'

export function TopBar() {
  return (
    <Box style={{ borderBottom: '1px solid var(--gray-a5)' }}>
      <Container size="3" px="5" py="3">
        <Flex justify="between" align="center" gap="4">
          <Link asChild underline="none" highContrast>
            <RouterLink to="/">
              <Text size="4" weight="bold">
                Date România
              </Text>
            </RouterLink>
          </Link>
          <Link asChild>
            <RouterLink to="/clasamente">
              <Flex align="center" gap="1">
                <BarChartIcon />
                Clasamente
              </Flex>
            </RouterLink>
          </Link>
        </Flex>
      </Container>
    </Box>
  )
}
