// src/utils/slug.ts
export function slugifyTag(tag: string) {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-");    // spaces → dashes
}

export function unslugifyTag(slug: string) {
  return slug.replace(/-/g, " ");
}
