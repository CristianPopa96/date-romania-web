import { createFileRoute } from '@tanstack/react-router'

import { entityRoute } from '#/features/entities/route'

export const Route = createFileRoute('/institutii/$cui')(
  entityRoute('institutions'),
)
