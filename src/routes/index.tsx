import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import {
  Badge,
  Box,
  Card,
  Container,
  Flex,
  Heading,
  Text,
  TextField,
} from '@radix-ui/themes'

import { getApiHealth } from '#/lib/api'

const healthQuery = queryOptions({
  queryKey: ['health'],
  queryFn: () => getApiHealth(),
})

export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(healthQuery),
  component: Home,
})

function Home() {
  const { data: health } = useSuspenseQuery(healthQuery)
  const apiUp = health?.status === 'ok'

  return (
    <Container size="3" px="5" py="9">
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="2">
          <Heading size="8" weight="bold">
            Date România
          </Heading>
          <Text size="3" color="gray">
            Unde merg banii publici: achiziții, contracte și plăți, cu sursa
            fiecărei cifre.
          </Text>
        </Flex>

        <TextField.Root
          size="3"
          placeholder="Caută o instituție, o firmă sau un CUI"
          aria-label="Caută"
        >
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>

        <Card>
          <Flex justify="between" align="center" gap="3">
            <Box>
              <Text as="div" size="2" weight="bold">
                Starea sistemului
              </Text>
              <Text as="div" size="2" color="gray">
                Legătura dintre site, API și baza de date
              </Text>
            </Box>
            <Badge color={apiUp ? 'green' : 'red'} size="2">
              {apiUp
                ? `API ${health.version} · bază de date ${health.database}`
                : 'API indisponibil'}
            </Badge>
          </Flex>
        </Card>
      </Flex>
    </Container>
  )
}
