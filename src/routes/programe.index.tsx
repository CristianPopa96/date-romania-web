import { createFileRoute, redirect } from '@tanstack/react-router'

// "Programe" in the top bar. One programme is held, so its page is the section; a list
// takes this address when a second one arrives.
export const Route = createFileRoute('/programe/')({
  beforeLoad: () => {
    throw redirect({ to: '/programe/anghel-saligny' })
  },
})
