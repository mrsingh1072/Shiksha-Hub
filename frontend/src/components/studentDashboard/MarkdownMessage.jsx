import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { parseDisplayContent } from '../../utils/contentParser'

function clampText(value, max = 12000) {
  if (!value) return ''
  const text = String(value)
  return text.length > max ? `${text.slice(0, max)}…` : text
}

const variantStyles = {
  default: {
    wrapper: 'prose prose-sm max-w-none text-gray-700',

    h1: 'mt-4 text-xl font-extrabold text-text',
    h2: 'mt-4 text-lg font-extrabold text-text',
    h3: 'mt-4 text-base font-extrabold text-text',

    text: 'text-gray-700',
    strong: 'text-text',
    code: 'bg-gray-900 text-gray-100',
    blockquote: 'border-green-primary/30 bg-cream/60 text-gray-700',
    tableBorder: 'border-green-primary/10',
    tableHead: 'bg-cream/80 text-text',
    hr: 'border-green-primary/10',
  },

  document: {
    wrapper: 'prose prose-lg max-w-none text-gray-700',

    h1: 'mt-6 text-3xl font-bold text-text first:mt-0',
    h2: 'mt-8 text-2xl font-bold text-text',
    h3: 'mt-6 text-xl font-semibold text-text',

    text: 'text-gray-700',
    strong: 'text-text',
    code: 'bg-gray-900 text-gray-100',
    blockquote: 'border-green-primary/30 bg-cream/60 text-gray-700',
    tableBorder: 'border-green-primary/10',
    tableHead: 'bg-cream/80 text-text',
    hr: 'border-green-primary/10',
  },

  board: {
    wrapper: 'max-w-none',

    h1: 'mt-6 text-4xl font-bold text-green-100 first:mt-0',
    h2: 'mt-8 text-3xl font-bold text-green-200',
    h3: 'mt-6 text-2xl font-semibold text-green-100',

    text: 'text-green-50',
    strong: 'text-white',
    code: 'bg-[#163728] text-green-100',
    blockquote: 'border-green-300 bg-[#234536] text-green-100',
    tableBorder: 'border-green-400/20',
    tableHead: 'bg-[#234536] text-green-100',
    hr: 'border-green-400/20',
  },
}

export default function MarkdownMessage({
  content = '',
  variant = 'default',
}) {
  const parsed = parseDisplayContent(content)
  const safe = clampText(parsed)

  if (!safe) {
    return (
      <p className="text-sm text-gray-500">
        No content available.
      </p>
    )
  }

  const style =
    variantStyles[variant] || variantStyles.default

  return (
    <div className={style.wrapper}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className={style.h1}>
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className={style.h2}>
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className={style.h3}>
              {children}
            </h3>
          ),

          p: ({ children }) => (
            <p className={`mt-4 leading-8 ${style.text}`}>
              {children}
            </p>
          ),

          ul: ({ children }) => (
            <ul className={`mt-4 list-disc space-y-3 pl-7 ${style.text}`}>
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className={`mt-4 list-decimal space-y-3 pl-7 ${style.text}`}>
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li className="leading-8">
              {children}
            </li>
          ),

          strong: ({ children }) => (
            <strong className={`font-bold ${style.strong}`}>
              {children}
            </strong>
          ),

          code: ({ inline, children }) =>
            inline ? (
              <code className="rounded bg-black/20 px-2 py-1 font-mono text-[0.9em]">
                {children}
              </code>
            ) : (
              <code className={`block overflow-x-auto rounded-xl p-4 font-mono text-[0.9em] ${style.code}`}>
                {children}
              </code>
            ),

          pre: ({ children }) => (
            <pre className="mt-5 overflow-x-auto rounded-xl">
              {children}
            </pre>
          ),

          blockquote: ({ children }) => (
            <blockquote
              className={`mt-5 border-l-4 px-4 py-3 italic ${style.blockquote}`}
            >
              {children}
            </blockquote>
          ),

          table: ({ children }) => (
            <div
              className={`mt-5 overflow-x-auto rounded-xl border ${style.tableBorder}`}
            >
              <table className="min-w-full text-left text-sm">
                {children}
              </table>
            </div>
          ),

          thead: ({ children }) => (
            <thead
              className={`text-xs font-bold uppercase tracking-wide ${style.tableHead}`}
            >
              {children}
            </thead>
          ),

          th: ({ children }) => (
            <th className="whitespace-nowrap px-4 py-3">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="px-4 py-3 align-top">
              {children}
            </td>
          ),

          hr: () => (
            <hr className={`my-8 ${style.hr}`} />
          ),
        }}
      >
        {safe}
      </ReactMarkdown>
    </div>
  )
}