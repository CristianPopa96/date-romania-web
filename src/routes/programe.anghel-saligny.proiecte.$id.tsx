import { createFileRoute, redirect } from '@tanstack/react-router'

// The old address of an Anghel Saligny project: its page is now under /proiecte.
export const Route = createFileRoute('/programe/anghel-saligny/proiecte/$id')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/proiecte/anghel-saligny/$id',
      params,
      replace: true,
      statusCode: 301,
    })
  },
})
