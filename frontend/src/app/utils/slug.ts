export function slugifyTag(tag: string) {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function unslugifyTag(slug = "") {
  return slug.replace(/-/g, " ");
}
