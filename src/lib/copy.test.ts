import { expect, it } from 'vitest'

import { pageTitle } from '#/lib/copy'

it('puts the page before the site name in a tab title', () => {
  expect(pageTitle('Clasamente')).toBe('Clasamente · Date România')
})
