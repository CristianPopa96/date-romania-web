// Fills a message that has a link or a styled part inside it: the message names the place
// as `{part}`, so each language can put it where its word order needs it.
//
//   rich('{code} în SEAP', { code: <Code>DA1</Code> })  ->  [<Code>DA1</Code>, ' în SEAP']

export function rich<T>(
  message: string,
  parts: Record<string, T>,
): Array<string | T> {
  return message
    .split(/(\{\w+\})/)
    .filter((piece) => piece !== '')
    .map((piece) => {
      const name = /^\{(\w+)\}$/.exec(piece)?.[1]
      return name !== undefined && name in parts ? parts[name] : piece
    })
}
