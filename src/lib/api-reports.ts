import { createServerFn } from '@tanstack/react-start'

import { getJson, postJson } from '#/lib/api'
import { checkReport } from '#/lib/reports'

// What was corrected after a reader's report: the page, and what changed in our words.
export type Correction = {
  page: string | null
  correction: string
  corrected_on: string
}

// The sources page must still open when this list cannot be read.
export const getCorrections = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<Correction>> => {
    try {
      const found = await getJson<{ items: Array<Correction> }>(
        '/v1/corrections',
      )
      return found?.items ?? []
    } catch {
      return []
    }
  },
)

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
      const status = await postJson('/v1/reports', checked.report)
      if (status === 201) return 'sent'
      return status === 429 ? 'busy' : 'failed'
    } catch {
      return 'failed'
    }
  })
