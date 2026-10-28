import type { QueryClient } from '@tanstack/react-query'
import { getRouteApi, notFound, redirect } from '@tanstack/react-router'

import { EntityView } from '#/features/entities/EntityView'
import { messagesFor } from '#/i18n'
import type { Locale } from '#/i18n'
import type { Role } from '#/lib/api'
import { pageTitle } from '#/lib/copy'
import { loadEntityPage } from '#/features/entities/queries'
import { cuiFromPath } from '#/lib/urls'
import { validateEntitySearch } from '#/features/entities/urls'
import type { EntitySearch } from '#/features/entities/urls'

// The institution and supplier pages differ only in role: one route for each, built here.
const PATHS = {
  institutions: '/institutii/$cui',
  suppliers: '/furnizori/$cui',
} as const

export function entityRoute(role: Role) {
  const route = getRouteApi(PATHS[role])

  function Page() {
    const { cui } = route.useParams()
    const search = route.useSearch()
    const navigate = route.useNavigate()
    return (
      <EntityView
        role={role}
        cui={Number(cui)}
        search={search}
        // Changing list, page or order keeps the reader at the table, not back at the top.
        // The address is cleaned as a link's would be, so the router never rewrites it.
        onSearch={(next) =>
          void navigate({
            search: validateEntitySearch(next),
            resetScroll: false,
          })
        }
      />
    )
  }

  return {
    validateSearch: validateEntitySearch,
    loaderDeps: ({ search }: { search: EntitySearch }) => search,
    loader: async ({
      context,
      params,
      deps,
    }: {
      context: { queryClient: QueryClient }
      params: { cui: string }
      deps: EntitySearch
    }) => {
      const cui = cuiFromPath(params.cui)
      if (cui === null) throw notFound()
      const found = await loadEntityPage(context.queryClient, role, cui, deps)
      if (!found) throw notFound()
      // A page past the end of the list goes to the last one that has rows.
      if (found.last !== null && (deps.pagina ?? 1) > found.last) {
        throw redirect({
          to: PATHS[role],
          params,
          search: { ...deps, pagina: found.last > 1 ? found.last : undefined },
        })
      }
      return { name: found.page.entity.name }
    },
    head: ({
      loaderData,
      match,
    }: {
      loaderData?: { name: string }
      match: { context: { locale: Locale } }
    }) => {
      const words = messagesFor(match.context.locale).common
      const fallback =
        role === 'institutions' ? words.institution : words.supplier
      return { meta: [{ title: pageTitle(loaderData?.name ?? fallback) }] }
    },
    component: Page,
  }
}
