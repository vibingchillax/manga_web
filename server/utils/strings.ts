// allows random subdomains but enforces base domain
export const makeDomainRegex = (domain: string) =>
  new RegExp(`^https?:\\/\\/(?:[A-Za-z0-9_-]+\\.)*${domain}(?:\\/|$)`, "i");
