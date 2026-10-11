import type { QueryClient } from '@tanstack/react-query'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouter,
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
import { messagesFor } from '#/i18n'
import type { Locale } from '#/i18n'
import { I18nProvider, useI18n } from '#/i18n/context'
import { rich } from '#/i18n/rich'
import { SITE_NAME } from '#/lib/copy'

import radixCss from '@radix-ui/themes/styles.css?url'
import appCss from '../styles.css?url'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  locale: Locale
}>()({
  head: ({ match }) => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: SITE_NAME },
      {
        name: 'description',
        content: messagesFor(match.context.locale).site.tagline,
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
})

// Theme values come from the Date România design system.
function RootDocument({ children }: { children: React.ReactNode }) {
  const { locale } = useRouter().options.context
  return (
    <html lang={locale}>
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
          <I18nProvider locale={locale}>
            <TopBar />
            <Box asChild style={{ minHeight: '70vh' }}>
              <main>{children}</main>
            </Box>
            <Footer />
          </I18nProvider>
        </Theme>
        <Scripts />
      </body>
    </html>
  )
}

function Footer() {
  const { t } = useI18n()
  return (
    <Box style={{ borderTop: '1px solid var(--gray-a5)' }}>
      <Container size="3" px="5" py="4">
        <Flex direction="column" gap="1">
          <Text size="1" color="gray">
            {t.site.footerData}
          </Text>
          <Text size="1" color="gray">
            {rich(t.site.footerCode, {
              site: (
                <Link
                  key="site"
                  href="https://github.com/CristianPopa96/date-romania-web"
                >
                  {t.site.footerSite}
                </Link>
              ),
              api: (
                <Link
                  key="api"
                  href="https://github.com/CristianPopa96/date-romania-api"
                >
                  {t.site.footerApi}
                </Link>
              ),
            })}
          </Text>
        </Flex>
      </Container>
    </Box>
  )
}

function NotFound() {
  const { t } = useI18n()
  return (
    <Container size="3" px="5" py="9">
      <Flex direction="column" gap="2">
        <Heading size="6">{t.notFound.title}</Heading>
        <Text size="2" color="gray">
          {t.notFound.hint}
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
