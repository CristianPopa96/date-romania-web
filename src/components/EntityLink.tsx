import { Link as RouterLink } from '@tanstack/react-router'
import { Link } from '@radix-ui/themes'

import type { Role } from '#/lib/api'

// A buyer opens on its institution page, a seller on its supplier page.
export function EntityLink({
  role,
  cui,
  children,
}: {
  role: Role
  cui: number
  children: React.ReactNode
}) {
  return (
    <Link asChild>
      <RouterLink
        to={role === 'institutions' ? '/institutii/$cui' : '/furnizori/$cui'}
        params={{ cui: String(cui) }}
      >
        {children}
      </RouterLink>
    </Link>
  )
}

export function roleOfKind(kind: string): Role {
  return kind === 'authority' ? 'institutions' : 'suppliers'
}
