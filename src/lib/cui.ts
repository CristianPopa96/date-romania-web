// Romanian tax IDs (CUI), checked the way the API checks them (cui.py there).

const KEY = '753217532'

function isValid(digits: string) {
  const body = digits.slice(0, -1).padStart(9, '0')
  let total = 0
  for (let index = 0; index < 9; index += 1) {
    total += Number(body[index]) * Number(KEY[index])
  }
  const expected = (total * 10) % 11
  return (expected === 10 ? 0 : expected) === Number(digits.at(-1))
}

// The CUI a search term is, when it is nothing else: "4981310", "RO 4981310",
// "ro4981310". Null for a name, a number that fails the checksum, or all zeros.
export function cuiFromQuery(text: string) {
  const match = /^(?:RO)?\s*(\d{2,10})$/i.exec(text.trim())
  if (!match) return null
  const digits = match[1]
  return Number(digits) > 0 && isValid(digits) ? Number(digits) : null
}

// What is searched for: a CUI is looked up by its digits, however it was typed.
export function searchTerm(text: string) {
  const cui = cuiFromQuery(text)
  return cui === null ? text : String(cui)
}
