export function urlFor(source) {
  if (!source || !source.asset || !source.asset._ref) return ''
  const ref = source.asset._ref
  const parts = ref.split('-')
  const assetId = parts[1]
  const dimensions = parts[2]
  const format = parts[3]
  // Hardcoded projectId/dataset to match client - could be passed in or env var
  return `https://cdn.sanity.io/images/s89mi5lk/production/${assetId}-${dimensions}.${format}`
}
