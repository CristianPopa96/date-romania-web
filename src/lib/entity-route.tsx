import type { QueryClient } from '@tanstack/react-query'
import { getRouteApi, notFound } from '@tanstack/react-router'

import { EntityView } from '#/components/EntityView'
import { messagesFor } from '#/i18n'
import type { Locale } from '#/i18n'
import type { Role } from '#/lib/api'
import { pageTitle } from '#/lib/copy'
import { loadEntityPage } from '#/lib/queries'
import { cuiFromPath, validateEntitySearch } from '#/lib/urls'
import type { EntitySearch } from '#/lib/urls'

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
        onSearch={(next) => void navigate({ search: next, resetScroll: false })}
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
      const page = await loadEntityPage(context.queryClient, role, cui, deps)
      if (!page) throw notFound()
      return { name: page.entity.name }
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
