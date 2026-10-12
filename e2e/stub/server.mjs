// A stand-in for the API during browser tests. It serves the answers saved from the real
// API (answers.json, copied from tests/fixtures/site_stub.json in date-romania-api), so the
// pages are tested on what the API really says. A call it has no answer for is a 501, and
// the page that made it fails loudly instead of showing an empty state.
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'

const answers = new Map()
const saved = JSON.parse(
  readFileSync(new URL('./answers.json', import.meta.url), 'utf-8'),
)

// The same call whatever order its parameters come in.
function key(address) {
  const url = new URL(address, 'http://stub')
  url.searchParams.sort()
  return url.pathname + url.search
}

for (const [call, answer] of Object.entries(saved)) {
  answers.set(key(call), answer)
}

const port = Number(process.env.PORT ?? 8099)

createServer((request, response) => {
  // The one call that sends something: a reader's report. The stub takes it and keeps
  // nothing, unless the text asks for the answer of a full queue.
  if (request.method === 'POST' && request.url === '/v1/reports') {
    let body = ''
    request.on('data', (chunk) => (body += chunk))
    request.on('end', () => {
      let message
      try {
        message = JSON.parse(body).message
      } catch {
        // Not JSON: refused below, like a body without a message.
      }
      const status =
        typeof message !== 'string'
          ? 422
          : message.includes('coada plină')
            ? 429
            : message.includes('text refuzat')
              ? 422
              : 201
      response.writeHead(status, { 'content-type': 'application/json' })
      response.end(
        JSON.stringify(status === 201 ? { id: 1 } : { detail: 'Refused' }),
      )
    })
    return
  }
  const answer = answers.get(key(request.url ?? '/'))
  if (!answer) console.error(`stub API: no saved answer for ${request.url}`)
  response.writeHead(answer?.status ?? 501, {
    'content-type': 'application/json',
  })
  response.end(
    JSON.stringify(answer?.body ?? { detail: 'No saved answer for this call' }),
  )
}).listen(port, '127.0.0.1', () => {
  console.log(`stub API on http://127.0.0.1:${port}`)
})
