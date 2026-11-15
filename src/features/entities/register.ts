// The register's states as the company page shows them (design Q86): only the ordinary
// one, "funcțiune", is plain text.
export function plainState(state: string) {
  return state.trim().toLowerCase() === 'funcțiune'
}
