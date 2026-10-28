import { useState } from 'react'
import { Badge, Flex, Link, Text } from '@radix-ui/themes'

import { DataState } from '#/components/DataState'
import { EntityLink } from '#/components/EntityLink'
import { useI18n } from '#/i18n/context'
import type { Winner } from '#/features/contracts/api'
import { foldWinners } from '#/features/contracts/contracts'

function Name({ winner }: { winner: Winner }) {
  if (winner.supplier) {
    return (
      <EntityLink role="suppliers" cui={winner.supplier.cui}>
        {winner.supplier.name}
      </EntityLink>
    )
  }
  // A foreign company, or a tax number that is not a valid CUI: SEAP's own words.
  return <>{winner.text ?? <DataState kind="notPublished" />}</>
}

// Who won a contract. An association is named as one, with its members in SEAP's order
// and folded after three: SEAP gives one value for all of them and names no leader.
export function Winners({ winners }: { winners: Array<Winner> }) {
  const { t, f } = useI18n()
  const [open, setOpen] = useState(false)

  if (winners.length === 0) return <DataState kind="notPublished" />
  if (winners.length === 1) return <Name winner={winners[0]} />

  const { shown, hidden } = foldWinners(winners, open)
  return (
    <Flex direction="column" gap="1" align="start">
      <Badge color="gray">
        {t.notice.association(f.count(winners.length))}
      </Badge>
      <Text size="2">
        {shown.map((winner, index) => (
          <span key={index}>
            {index > 0 ? ', ' : null}
            <Name winner={winner} />
          </span>
        ))}
      </Text>
      {hidden > 0 ? (
        <Link asChild size="1">
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{
              background: 'none',
              border: 0,
              padding: 0,
              cursor: 'pointer',
            }}
          >
            {t.notice.moreMembers(hidden, f.count(hidden))}
          </button>
        </Link>
      ) : null}
    </Flex>
  )
}
