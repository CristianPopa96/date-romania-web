import type { QueryClient } from '@tanstack/react-query'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { Theme } from '@radix-ui/themes'

import radixCss from '@radix-ui/themes/styles.css?url'
import appCss from '../styles.css?url'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { title: 'Date România' },
        {
          name: 'description',
          content:
            'Unde merg banii publici: achiziții, contracte și plăți, cu sursa fiecărei cifre.',
        },
      ],
      links: [
        { rel: 'stylesheet', href: radixCss },
        { rel: 'stylesheet', href: appCss },
      ],
    }),
    shellComponent: RootDocument,
  },
)

// Theme values come from the Date România design system.
function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <HeadContent />
      </head>
      <body>
        <Theme
          appearance="dark"
          accentColor="indigo"
          grayColor="slate"
          radius="medium"
          scaling="100%"
          panelBackground="solid"
        >
          {children}
        </Theme>
        <Scripts />
      </body>
    </html>
  )
}
