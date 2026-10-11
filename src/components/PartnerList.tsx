import { Card, Flex, Heading, Text } from '@radix-ui/themes'

import { BarList } from '#/components/BarList'
import { useI18n } from '#/i18n/context'
import type { Partner, Role } from '#/lib/api'

// The other side of an entity's accepted purchases: the suppliers of an institution, or
// the institutions a supplier sold to.
export function PartnerList({
  role,
  partners,
}: {
  role: Role
  partners: Array<Partner>
}) {
  const { t, f } = useI18n()
  const text = t.partners[role]
  const other: Role = role === 'institutions' ? 'suppliers' : 'institutions'

  return (
    <Flex direction="column" gap="3">
      <Heading size="4">{text.title}</Heading>
      {partners.length > 0 ? (
        <Card>
          <BarList
            rows={partners}
            role={other}
            note={(row) =>
              t.partners.accepted(row.accepted, f.count(row.accepted))
            }
          />
        </Card>
      ) : (
        <Text size="2" color="gray">
          {text.none}
        </Text>
      )}
    </Flex>
  )
}
