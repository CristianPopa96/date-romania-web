import { createFileRoute } from '@tanstack/react-router'

import { entityRoute } from '#/features/entities/route'

export const Route = createFileRoute('/furnizori/$cui')(
  entityRoute('suppliers'),
)
