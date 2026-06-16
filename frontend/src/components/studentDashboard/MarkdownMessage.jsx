import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { parseDisplayContent } from '../../utils/contentParser'

const base = 'prose prose-sm max-w-none text-gray-700'

function clampText(value, max = 12000) {
  if (!value) return ''
  const text = String(value)
  return text.length > max ? `${text.slice(0, max)}…` : text
}

export default function MarkdownMessage({ content = '', variant = 'default' }) {
  const parsed = parseDisplayContent(content)
  const safe = clampText(parsed)

  if (!safe) {
    return <p className="text-sm text-gray-500">No content available.</p>
  }

  const headingClass = variant === 'document'
    ? {
        h1: 'mt-6 text-3xl font-bold text-text first:mt-0',
        h2: 'mt-8 text-2xl font-bold text-text',
        h3: 'mt-6 text-xl font-semibold text-text',
      }
    : {
        h1: 'mt-4 text-xl font-extrabold text-text',
        h2: 'mt-4 text-lg font-extrabold text-text',
        h3: 'mt-4 text-base font-extrabold text-text',
      }

  return (
    <div className={base}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => <h1 className={headingClass.h1}>{children}</h1>,
          h2: ({ children }) => <h2 className={headingClass.h2}>{children}</h2>,
          h3: ({ children }) => <h3 className={headingClass.h3}>{children}</h3>,
          p: ({ children }) => <p className="mt-3 leading-7 text-gray-700">{children}</p>,
          ul: ({ children }) => <ul className="mt-3 list-disc space-y-2 pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="mt-3 list-decimal space-y-2 pl-6">{children}</ol>,
          li: ({ children }) => <li className="leading-7">{children}</li>,
          strong: ({ children }) => <strong className="font-bold text-text">{children}</strong>,
          code: ({ inline, children }) =>
            inline ? (
              <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[0.85em] text-text">{children}</code>
            ) : (
              <code className="block overflow-x-auto rounded-xl bg-gray-900 p-4 font-mono text-[0.85em] text-gray-100">
                {children}
              </code>
            ),
          pre: ({ children }) => <pre className="mt-4 overflow-x-auto rounded-xl">{children}</pre>,
          blockquote: ({ children }) => (
            <blockquote className="mt-4 border-l-4 border-green-primary/30 bg-cream/60 px-4 py-3 italic text-gray-700">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="mt-4 overflow-x-auto rounded-xl border border-green-primary/10">
              <table className="min-w-full text-left text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-cream/80 text-xs font-bold uppercase tracking-wide">{children}</thead>,
          th: ({ children }) => <th className="whitespace-nowrap px-4 py-3">{children}</th>,
          td: ({ children }) => <td className="px-4 py-3 align-top">{children}</td>,
          hr: () => <hr className="my-6 border-green-primary/10" />,
        }}
      >
        {safe}
      </ReactMarkdown>
    </div>
  )
}

