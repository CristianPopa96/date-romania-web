// A reader's error report, checked before it is sent. The API applies the same limits.
export const MESSAGE_MIN = 10
export const MESSAGE_MAX = 4000
const PAGE_MAX = 300
const EVIDENCE_MAX = 500

export type ReportFields = { page: string; message: string; evidence: string }
export type Report = { page?: string; message: string; evidence?: string }
export type ReportProblem = 'tooShort' | 'tooLong'

export function checkReport(
  fields: ReportFields,
): { report: Report; problem?: undefined } | { problem: ReportProblem } {
  const message = fields.message.trim()
  if (message.length < MESSAGE_MIN) return { problem: 'tooShort' }
  if (message.length > MESSAGE_MAX) return { problem: 'tooLong' }
  return {
    report: {
      page: fields.page.trim().slice(0, PAGE_MAX) || undefined,
      message,
      evidence: fields.evidence.trim().slice(0, EVIDENCE_MAX) || undefined,
    },
  }
}

// An address inside the site ("/contracte/9001"), or nothing: a link to the form may
// carry the page it came from, and only such an address is taken from it or linked to.
export function sitePath(value: unknown) {
  if (typeof value !== 'string') return undefined
  if (!/^\/(?!\/)[^\s\\]*$/.test(value) || value.length > PAGE_MAX) {
    return undefined
  }
  return value
}
