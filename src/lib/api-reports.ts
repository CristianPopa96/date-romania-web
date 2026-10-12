import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader, getRequestIP } from '@tanstack/react-start/server'

import { getJson, postJson } from '#/lib/api'
import { checkReport } from '#/lib/reports'

// What was corrected after a reader's report: the page, and what changed in our words.
export type Correction = {
  page: string | null
  correction: string
  corrected_on: string
}

// The sources page must still open when this list cannot be read. Null says so: an
// empty list would state that nothing was ever corrected.
export const getCorrections = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<Correction> | null> => {
    try {
      const found = await getJson<{ items: Array<Correction> }>(
        '/v1/corrections',
      )
      return found?.items ?? null
    } catch {
      return null
    }
  },
)

// The reader's address, passed on so the API can take a few reports an hour from each
// reader instead of counting everyone together. The API keeps only a hash of it.
// Cloudflare names the reader in its own header; `X-Forwarded-For` can be written by
// the caller, so it is used only when nothing better is there.
function readerAddress() {
  return (
    getRequestHeader('cf-connecting-ip') ??
    getRequestIP({ xForwardedFor: true })
  )
}

export type ReportOutcome = 'sent' | 'invalid' | 'busy' | 'failed'

// `website` is a field no reader sees. A program that fills in every field fills it too;
// its report is dropped, and it is told the same as a reader.
export const sendReport = createServerFn({ method: 'POST' })
  .inputValidator((data: Record<string, unknown>) => ({
    page: String(data.page ?? ''),
    message: String(data.message ?? ''),
    evidence: String(data.evidence ?? ''),
    website: String(data.website ?? ''),
  }))
  .handler(async ({ data }): Promise<ReportOutcome> => {
    if (data.website) return 'sent'
    const checked = checkReport(data)
    if (checked.problem) return 'invalid'
    try {
      const address = readerAddress()
      const status = await postJson(
        '/v1/reports',
        checked.report,
        address ? { 'x-forwarded-for': address } : {},
      )
      if (status === 201) return 'sent'
      // 422: the API refused the text itself, so trying again later would not help.
      if (status === 422) return 'invalid'
      return status === 429 ? 'busy' : 'failed'
    } catch {
      return 'failed'
    }
  })
