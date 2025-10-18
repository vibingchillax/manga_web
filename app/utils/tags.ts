export function sortedTags(tags: Tag[]) {
  const lowerTags = tags.map(t => ({
    original: t,
    name: t.attributes?.name?.en?.toLowerCase() ?? ''
  }))

  const priorityOrder = ['doujinshi', 'gore', 'sexual violence']
  const priorityTags: Tag[] = []
  const otherTags: Tag[] = []

  for (const tag of lowerTags) {
    if (priorityOrder.includes(tag.name)) {
      priorityTags.push(tag.original)
    } else {
      otherTags.push(tag.original)
    }
  }

  priorityTags.sort((a, b) => {
    const aIndex = priorityOrder.indexOf((a.attributes?.name?.en ?? '').toLowerCase())
    const bIndex = priorityOrder.indexOf((b.attributes?.name?.en ?? '').toLowerCase())
    return aIndex - bIndex
  })

  otherTags.sort((a, b) => {
    const aName = a.attributes?.name?.en ?? ''
    const bName = b.attributes?.name?.en ?? ''
    return aName.localeCompare(bName)
  })
  return [...priorityTags, ...otherTags]
}

export function routeToTag(tag: Tag) {
  return `/tag/${tag.id}/${toKebabCase(tag.attributes?.name?.en)}`
}