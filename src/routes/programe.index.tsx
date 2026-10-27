import { Link as RouterLink, createFileRoute } from '@tanstack/react-router'
import {
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Link,
  Text,
} from '@radix-ui/themes'

import { messagesFor } from '#/i18n'
import { useI18n } from '#/i18n/context'
import { pageTitle } from '#/lib/copy'

// "Programe" in the top bar: the programmes held, each with its own page. A plain list
// until the design thread gives the section its screen (design Q54).
export const Route = createFileRoute('/programe/')({
  head: ({ match }) => ({
    meta: [
      { title: pageTitle(messagesFor(match.context.locale).nav.programmes) },
    ],
  }),
  component: ProgrammesPage,
})

function ProgrammesPage() {
  const { t } = useI18n()
  const programmes = [
    {
      to: '/programe/pnrr',
      eyebrow: t.pnrr.eyebrow,
      title: t.pnrr.title,
      lead: t.pnrr.lead,
    },
    {
      to: '/programe/fonduri-europene',
      eyebrow: t.eu.eyebrow,
      title: t.eu.title,
      lead: t.eu.lead,
    },
    {
      to: '/programe/anghel-saligny',
      eyebrow: t.programme.eyebrow,
      title: t.programme.title,
      lead: t.programme.lead,
    },
  ] as const

  return (
    <Container size="4" px="5" py="7">
      <Flex direction="column" gap="5">
        <Heading size="7">{t.nav.programmes}</Heading>
        <Grid columns={{ initial: '1', md: '2' }} gap="4">
          {programmes.map((programme) => (
            <Card key={programme.to} size="3">
              <Flex direction="column" gap="2">
                <Text size="1" color="gray" weight="medium">
                  {programme.eyebrow}
                </Text>
                <Heading as="h2" size="5">
                  <Link asChild>
                    <RouterLink to={programme.to}>{programme.title}</RouterLink>
                  </Link>
                </Heading>
                <Text size="2" color="gray">
                  {programme.lead}
                </Text>
              </Flex>
            </Card>
          ))}
        </Grid>
      </Flex>
    </Container>
  )
}
