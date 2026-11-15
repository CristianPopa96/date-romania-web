import { Badge, Code, Flex, Text } from '@radix-ui/themes'

import { SourceLine } from '#/components/SourceLine'
import { useI18n } from '#/i18n/context'
import type { EntityPage } from '#/features/entities/api'
import { plainState } from '#/features/entities/register'

type Register = NonNullable<EntityPage['trade_register']>

// What the trade register says of a company, under its name: its registration, form,
// registration day and states as the register writes them (design Q86). "funcțiune" is
// plain text; any other state is a gray outline badge in the register's own word, never
// red or amber: a fact, not a judgement. A state change is known only to the edition it
// was first seen in, so that is the day it carries.
export function RegisterLine({ register }: { register: Register }) {
  const { t, f } = useI18n()
  const e = t.entity
  const parts = [
    register.legal_form,
    register.registered_on
      ? e.registeredOn(f.day(register.registered_on))
      : null,
  ].filter(Boolean)
  const plain = register.states.filter(plainState)
  const marked = register.states.filter((state) => !plainState(state))
  return (
    <Flex direction="column" gap="1">
      <Flex gap="2" align="center" wrap="wrap">
        <Text size="2" color="gray">
          {e.register} <Code variant="ghost">{register.registration}</Code>
          {parts.length ? ` · ${parts.join(' · ')}` : null}
          {register.states.length ? ` · ${e.state(plain.join(', '))}` : null}
        </Text>
        {marked.map((state) => (
          <Badge key={state} color="gray" variant="outline">
            {state}
          </Badge>
        ))}
        {register.since ? (
          <Text size="2" color="gray">
            {e.stateSince(f.day(register.since))}
          </Text>
        ) : null}
      </Flex>
      <SourceLine source={register.source} />
    </Flex>
  )
}
