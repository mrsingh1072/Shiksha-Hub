/**
 * Safely extract displayable text from tutor/AI responses that may be raw JSON strings.
 */
export function parseDisplayContent(value) {
  if (value == null) return ''

  if (typeof value === 'object') {
    return (
      value.documentation ||
      value.reply ||
      value.content ||
      value.answer ||
      ''
    )
  }

  const text = String(value).trim()
  if (!text) return ''

  if (text.startsWith('{') || text.startsWith('[')) {
    try {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        if (parsed.documentation) return String(parsed.documentation)
        if (parsed.reply) return String(parsed.reply)
        if (parsed.answer) return String(parsed.answer)
        if (parsed.content) return String(parsed.content)
      }
    } catch {
      // fall through
    }

    if (text.includes('"documentation"')) {
      const docMatch = text.match(/"documentation"\s*:\s*"((?:\\.|[^"\\])*)"/)
      if (docMatch) {
        return docMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
      }
    }
  }

  return text
}

export function isRawJsonLike(value) {
  const text = String(value || '').trim()
  return text.startsWith('{') && (text.includes('"questions"') || text.includes('"documentation"'))
}

export function formatExamCard(exam) {
  const title = isRawJsonLike(exam?.title)
    ? 'Exam Attempt (Legacy)'
    : exam?.title || 'Exam Attempt'

  if (exam?.score != null && exam?.total != null) {
    const percentage = exam.percentage ?? Math.round((exam.score / exam.total) * 100)
    const status = exam.status || (exam.passed ? 'Passed' : 'Failed')
    return {
      title,
      summary: `Score: ${exam.score}/${exam.total}`,
      percentage: `${percentage}%`,
      status,
    }
  }

  if (isRawJsonLike(exam?.answer)) {
    return {
      title,
      summary: 'Legacy record',
      percentage: '',
      status: '',
    }
  }

  return {
    title,
    summary: exam?.answer || '',
    percentage: '',
    status: exam?.status || '',
  }
}
