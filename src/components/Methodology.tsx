import { Card, Flex, Grid, Heading, Text } from '@radix-ui/themes'

import { useI18n } from '#/i18n/context'
import {
  DIRECT_PURCHASE_LIMIT,
  DIRECT_PURCHASE_LIMIT_GOODS_SERVICES,
} from '#/lib/api'
import type { Dataset } from '#/lib/api'

// How the figures on the site are counted, rule by rule. The rules themselves live in
// the API (`money.py`); this page only says them in words.
export function Methodology({ datasets }: { datasets: Array<Dataset> }) {
  const { t, f } = useI18n()
  const documents = datasets.reduce((sum, each) => sum + each.documents, 0)
  const awards = datasets.find((each) => each.key === 'seap-awards')
  const days = awards ? f.span(awards.first_day, awards.last_day) : null

  const rules = [
    { title: t.method.acceptedTitle, text: t.method.accepted },
    {
      title: t.method.limitTitle,
      text: t.method.limit(
        f.lei(DIRECT_PURCHASE_LIMIT_GOODS_SERVICES),
        f.lei(DIRECT_PURCHASE_LIMIT),
      ),
    },
    { title: t.method.noticeTitle, text: t.method.notice },
    { title: t.method.frameworkTitle, text: t.notice.whyFramework },
    {
      title: t.method.associationTitle,
      text: `${t.notice.whyAssociation} ${t.method.association}`,
    },
    { title: t.method.apartTitle, text: t.method.apart },
    ...(days
      ? [
          {
            title: t.period.incompleteTitle,
            text: t.period.incomplete(days.from, days.to),
          },
        ]
      : []),
    { title: t.method.vatTitle, text: t.method.vat },
    { title: t.method.personalTitle, text: t.method.personal },
    {
      title: t.method.rawTitle,
      text: t.method.raw(documents, f.count(documents)),
    },
  ]

  return (
    <Flex direction="column" gap="5">
      <Flex direction="column" gap="3">
        <Heading size="5">{t.method.title}</Heading>
        <Grid columns={{ initial: '1', md: '2' }} gap="3">
          {rules.map((rule) => (
            <Card key={rule.title}>
              <Flex direction="column" gap="1">
                <Text size="2" weight="bold">
                  {rule.title}
                </Text>
                <Text size="2" color="gray">
                  {rule.text}
                </Text>
              </Flex>
            </Card>
          ))}
        </Grid>
      </Flex>
      <Flex direction="column" gap="2">
        <Heading size="5">{t.method.gapTitle}</Heading>
        <Text size="2" color="gray" style={{ maxWidth: '75ch' }}>
          {t.method.gap}
        </Text>
      </Flex>
    </Flex>
  )
}
