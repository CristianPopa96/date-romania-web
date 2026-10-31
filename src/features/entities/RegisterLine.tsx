import { Code, Flex, Text } from '@radix-ui/themes'

import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import type { EntityPage } from '#/features/entities/api'

type Register = NonNullable<EntityPage['trade_register']>

// What the trade register says of a company, under its name: its registration, form,
// registration day and states as the register writes them. A state change is known only
// to the edition it was first seen in, so that is the day it carries.
export function RegisterLine({ register }: { register: Register }) {
  const { t, f } = useI18n()
  const e = t.entity
  const parts = [
    register.legal_form,
    register.registered_on
      ? e.registeredOn(f.day(register.registered_on))
      : null,
    e.state(register.states.join(', ')),
    register.since ? e.stateSince(f.day(register.since)) : null,
  ].filter(Boolean)
  return (
    <Flex direction="column" gap="1">
      <Text size="2" color="gray">
        {e.register} <Code variant="ghost">{register.registration}</Code> ·{' '}
        {parts.join(' · ')}
      </Text>
      <SourceLine source={register.source} />
    </Flex>
  )
}
