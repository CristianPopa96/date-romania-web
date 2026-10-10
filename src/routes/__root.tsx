import type { QueryClient } from '@tanstack/react-query'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import {
  Box,
  Container,
  Flex,
  Heading,
  Link,
  Text,
  Theme,
} from '@radix-ui/themes'

import { Unavailable } from '#/components/Notes'
import { TopBar } from '#/components/TopBar'

import radixCss from '@radix-ui/themes/styles.css?url'
import appCss from '../styles.css?url'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { title: 'Date România' },
        {
          name: 'description',
          content:
            'Unde merg banii publici: achiziții, contracte și plăți, cu sursa fiecărei cifre.',
        },
      ],
      links: [
        { rel: 'stylesheet', href: radixCss },
        { rel: 'stylesheet', href: appCss },
      ],
    }),
    shellComponent: RootDocument,
    notFoundComponent: NotFound,
    errorComponent: Failed,
  },
)

// Theme values come from the Date România design system.
function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <HeadContent />
      </head>
      <body>
        <Theme
          appearance="dark"
          accentColor="indigo"
          grayColor="slate"
          radius="medium"
          scaling="100%"
          panelBackground="solid"
        >
          <TopBar />
          <Box asChild style={{ minHeight: '70vh' }}>
            <main>{children}</main>
          </Box>
          <Footer />
        </Theme>
        <Scripts />
      </body>
    </html>
  )
}

function Footer() {
  return (
    <Box style={{ borderTop: '1px solid var(--gray-a5)' }}>
      <Container size="3" px="5" py="4">
        <Flex direction="column" gap="1">
          <Text size="1" color="gray">
            Datele provin din surse publice și pot fi refolosite sub licența CC
            BY 4.0. Fiecare cifră își arată sursa.
          </Text>
          <Text size="1" color="gray">
            Codul este public:{' '}
            <Link href="https://github.com/CristianPopa96/date-romania-web">
              site
            </Link>{' '}
            și{' '}
            <Link href="https://github.com/CristianPopa96/date-romania-api">
              API
            </Link>
            .
          </Text>
        </Flex>
      </Container>
    </Box>
  )
}

function NotFound() {
  return (
    <Container size="3" px="5" py="9">
      <Flex direction="column" gap="2">
        <Heading size="6">Pagina nu există</Heading>
        <Text size="2" color="gray">
          Verifică adresa sau caută instituția ori firma după nume sau CUI.
        </Text>
      </Flex>
    </Container>
  )
}

function Failed() {
  return (
    <Container size="3" px="5" py="9">
      <Unavailable />
    </Container>
  )
}
