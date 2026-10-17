// Romanian tax IDs (CUI) typed into search. The checksum is the API's alone (cui.py
// there): it stores only valid CUIs, so a number that matches one of its results is one.

// The CUI a search term could be, when it is nothing else: "4981310", "RO 4981310",
// "ro4981310". Null for a name, a number of the wrong length, or all zeros.
export function cuiFromQuery(text: string) {
  const match = /^(?:RO)?\s*(\d{2,10})$/i.exec(text.trim())
  if (!match) return null
  const digits = Number(match[1])
  return digits > 0 ? digits : null
}

// What is searched for: a CUI is looked up by its digits, however it was typed.
export function searchTerm(text: string) {
  const cui = cuiFromQuery(text)
  return cui === null ? text : String(cui)
}
