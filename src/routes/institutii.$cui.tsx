import { createFileRoute } from '@tanstack/react-router'

import { entityRoute } from '#/lib/entity-route'

export const Route = createFileRoute('/institutii/$cui')(
  entityRoute('institutions'),
)
