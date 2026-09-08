export function collapseExcessBlankLines(source: string): string {
  return source
    .replaceAll('\r\n', '\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n{2,}\}/g, '\n}')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '\n')
}
