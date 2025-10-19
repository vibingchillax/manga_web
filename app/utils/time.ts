export function parseDuration(str: string) {
  // ISO 8601 duration like "P1DT2H" → { days: 1, hours: 2 }
  const regex =
    /P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/;
  const match = str.match(regex)
  if (!match) return null

  const [, y, mo, w, d, h, mi, s] = match.map((n) => (n ? parseInt(n) : 0))
  return {
    years: y || 0,
    months: mo || 0,
    weeks: w || 0,
    days: d || 0,
    hours: h || 0,
    minutes: mi || 0,
    seconds: s || 0
  }
}

export function buildDuration(seconds: number, minutes: number, hours: number, days: number) {
  const parts: string[] = []
  if (days) parts.push(`${days}D`)
  const time: string[] = []
  if (hours) time.push(`${hours}H`)
  if (minutes) time.push(`${minutes}M`)
  if (seconds) time.push(`${seconds}S`)

  return `P${parts.join("")}${time.length ? "T" + time.join("") : ""}` || "P0D"
}