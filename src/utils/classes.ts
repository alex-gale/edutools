export function classes (...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ')
}
