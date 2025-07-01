export function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+(?:\s+\w+)*)/g
  const mentions: string[] = []
  let match

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1].trim())
  }

  return [...new Set(mentions)]
}