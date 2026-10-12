// How Romanian counts things, shared by the files that hold the Romanian text.

const rules = new Intl.PluralRules('ro')

type Forms = { one: string; few: string; other: string }

export function plural(n: number, forms: Forms) {
  const form = rules.select(n)
  return form === 'one' || form === 'few' ? forms[form] : forms.other
}

// "5 achiziții", "20 de achiziții": Romanian puts "de" after numbers from 20 up.
export function counted(n: number, text: string, one: string, many: string) {
  return plural(n, {
    one,
    few: `${text} ${many}`,
    other: `${text} de ${many}`,
  })
}
