import { useRef, useState } from 'react'
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
import {
  EVIDENCE_MAX,
  MESSAGE_MAX,
  MESSAGE_MIN,
  PAGE_MAX,
  checkReport,
} from '#/lib/reports'
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
  const messageField = useRef<HTMLTextAreaElement>(null)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const fields = { page, message, evidence }
    const checked = checkReport(fields)
    if (checked.problem) {
      setState(checked.problem)
      messageField.current?.focus()
      return
    }
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
    if (outcome === 'invalid') messageField.current?.focus()
    setState(outcome)
  }

  // What is wrong with the text itself, as against a report that could not be sent.
  const textProblem =
    state === 'tooShort'
      ? t.report.tooShort(f.count(MESSAGE_MIN))
      : state === 'tooLong'
        ? t.report.tooLong(f.count(MESSAGE_MAX))
        : state === 'invalid'
          ? t.report.invalid
          : null
  const problem =
    textProblem ??
    (state === 'busy'
      ? t.report.busy
      : state === 'failed'
        ? t.report.failed
        : null)

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
                maxLength={PAGE_MAX}
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
                ref={messageField}
                id="report-message"
                value={message}
                rows={4}
                maxLength={MESSAGE_MAX}
                placeholder={t.report.messageHint}
                aria-invalid={textProblem ? true : undefined}
                aria-describedby={
                  textProblem
                    ? 'report-message-hint report-problem'
                    : 'report-message-hint'
                }
                onChange={(event) => setMessage(event.target.value)}
              />
              <Text id="report-message-hint" size="1" color="gray">
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
                maxLength={EVIDENCE_MAX}
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
              <Callout.Root
                id="report-problem"
                color="amber"
                size="1"
                role="alert"
              >
                <Callout.Text>{problem}</Callout.Text>
              </Callout.Root>
            ) : null}
            {/* Always on the page, so a screen reader hears the text when it arrives. */}
            <div role="status">
              {state === 'sent' ? (
                <Callout.Root color="green" size="1">
                  <Callout.Text>{t.report.sent}</Callout.Text>
                </Callout.Root>
              ) : null}
            </div>
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
