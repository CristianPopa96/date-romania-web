import { useState } from 'react'
import { ExternalLinkIcon, FileTextIcon } from '@radix-ui/react-icons'
import {
  Button,
  Callout,
  Card,
  Flex,
  Heading,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes'

import { useI18n } from '#/i18n/context'
import { sendReport } from '#/lib/api-reports'
import type { ReportOutcome } from '#/lib/api-reports'
import { MESSAGE_MAX, MESSAGE_MIN, checkReport } from '#/lib/reports'
import type { ReportProblem } from '#/lib/reports'

// Where the links "Raportează o eroare" land.
export const REPORT_ANCHOR = 'raporteaza'

type State = 'idle' | 'sending' | ReportOutcome | ReportProblem

// A reader says what is wrong on a page. The report goes to a queue a person reads;
// nothing on the site changes until then. `about` is the page the reader came from.
export function ReportForm({ about }: { about?: string }) {
  const { t, f } = useI18n()
  const [page, setPage] = useState(about ?? '')
  const [message, setMessage] = useState('')
  const [evidence, setEvidence] = useState('')
  const [website, setWebsite] = useState('')
  const [state, setState] = useState<State>('idle')

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const fields = { page, message, evidence }
    const checked = checkReport(fields)
    if (checked.problem) return setState(checked.problem)
    setState('sending')
    let outcome: ReportOutcome
    try {
      outcome = await sendReport({ data: { ...fields, website } })
    } catch {
      outcome = 'failed'
    }
    if (outcome === 'sent') {
      setMessage('')
      setEvidence('')
    }
    setState(outcome)
  }

  const problem =
    state === 'tooShort' || state === 'invalid'
      ? t.report.tooShort(f.count(MESSAGE_MIN))
      : state === 'tooLong'
        ? t.report.tooLong(f.count(MESSAGE_MAX))
        : state === 'busy'
          ? t.report.busy
          : state === 'failed'
            ? t.report.failed
            : null

  return (
    <Flex direction="column" gap="3" id={REPORT_ANCHOR}>
      <Flex direction="column" gap="2">
        <Heading size="5">{t.report.title}</Heading>
        <Text size="2" color="gray" style={{ maxWidth: '70ch' }}>
          {t.report.lead}
        </Text>
      </Flex>
      <Card size="3" style={{ maxWidth: 640 }}>
        <form onSubmit={(event) => void submit(event)} noValidate>
          <Flex direction="column" gap="3">
            <Flex direction="column" gap="1">
              <Text as="label" size="2" weight="medium" htmlFor="report-page">
                {t.report.page}
              </Text>
              <TextField.Root
                id="report-page"
                value={page}
                maxLength={300}
                placeholder={t.report.pageHint}
                onChange={(event) => setPage(event.target.value)}
              >
                <TextField.Slot>
                  <FileTextIcon />
                </TextField.Slot>
              </TextField.Root>
            </Flex>
            <Flex direction="column" gap="1">
              <Text
                as="label"
                size="2"
                weight="medium"
                htmlFor="report-message"
              >
                {t.report.message}
              </Text>
              <TextArea
                id="report-message"
                value={message}
                rows={4}
                maxLength={MESSAGE_MAX}
                placeholder={t.report.messageHint}
                onChange={(event) => setMessage(event.target.value)}
              />
              <Text size="1" color="gray">
                {t.report.noPersonal}
              </Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text
                as="label"
                size="2"
                weight="medium"
                htmlFor="report-evidence"
              >
                {t.report.evidence}
              </Text>
              <TextField.Root
                id="report-evidence"
                value={evidence}
                maxLength={500}
                placeholder={t.report.evidenceHint}
                onChange={(event) => setEvidence(event.target.value)}
              >
                <TextField.Slot>
                  <ExternalLinkIcon />
                </TextField.Slot>
              </TextField.Root>
            </Flex>
            {/* Not for readers: see `sendReport`. */}
            <input
              name="website"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: 'absolute', left: -9999, width: 1, height: 1 }}
            />
            {problem ? (
              <Callout.Root color="amber" size="1" role="alert">
                <Callout.Text>{problem}</Callout.Text>
              </Callout.Root>
            ) : null}
            {state === 'sent' ? (
              <Callout.Root color="green" size="1" role="status">
                <Callout.Text>{t.report.sent}</Callout.Text>
              </Callout.Root>
            ) : null}
            <Flex justify="between" align="center" gap="3" wrap="wrap">
              <Text size="1" color="gray">
                {t.report.public}
              </Text>
              <Button type="submit" disabled={state === 'sending'}>
                {state === 'sending' ? t.report.sending : t.report.send}
              </Button>
            </Flex>
          </Flex>
        </form>
      </Card>
    </Flex>
  )
}
