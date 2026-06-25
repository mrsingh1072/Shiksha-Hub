import MarkdownMessage from '../studentDashboard/MarkdownMessage'
import { BookOpen, Code2, HelpCircle, AlertTriangle, Target, Lightbulb, ListChecks } from 'lucide-react'

const SECTION_COMPONENTS = {
  overview: { icon: BookOpen, title: 'Overview', color: 'text-blue-300' },
  learningObjectives: { icon: Target, title: 'Learning Objectives', color: 'text-green-300' },
  concepts: { icon: Lightbulb, title: 'Core Concepts', color: 'text-amber-300' },
  examples: { icon: Lightbulb, title: 'Examples', color: 'text-purple-300' },
  code: { icon: Code2, title: 'Code', color: 'text-cyan-300' },
  summary: { icon: ListChecks, title: 'Summary', color: 'text-green-300' },
  commonMistakes: { icon: AlertTriangle, title: 'Common Mistakes', color: 'text-red-300' },
  practiceQuestions: { icon: HelpCircle, title: 'Practice Questions', color: 'text-indigo-300' },
}

function SectionHeader({ icon: Icon, title, color }) {
  return (
    <div className={`mt-8 flex items-center gap-3 border-b border-white/10 pb-3 first:mt-0 ${color}`}>
      <Icon className="h-5 w-5" />
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
  )
}

function renderSectionContent(key, data) {
  if (typeof data === 'string') {
    return <MarkdownMessage content={data} variant="board" />
  }

  if (key === 'learningObjectives' || key === 'commonMistakes') {
    return (
      <ul className="space-y-2 pl-4">
        {data.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-green-50">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
            <span className="leading-7">
              {typeof item === 'string' ? item : item.content || item.text || JSON.stringify(item)}
            </span>
          </li>
        ))}
      </ul>
    )
  }

  if (key === 'concepts') {
    return (
      <div className="space-y-6">
        {data.map((concept, i) => (
          <div key={i}>
            {concept.heading && (
              <h4 className="text-lg font-bold text-green-200">{concept.heading}</h4>
            )}
            <div className="mt-2 text-green-50 leading-7">
              <MarkdownMessage content={concept.content || concept.text || ''} variant="board" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (key === 'examples') {
    return (
      <div className="space-y-6">
        {data.map((example, i) => (
          <div key={i} className="rounded-xl bg-[#234536] p-4">
            {example.title && (
              <h4 className="font-bold text-green-200">{example.title}</h4>
            )}
            <div className="mt-2 text-green-50">
              <MarkdownMessage content={example.content || example.text || ''} variant="board" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (key === 'code') {
    return (
      <div className="space-y-6">
        {data.map((block, i) => (
          <div key={i}>
            {block.title && (
              <h4 className="font-bold text-cyan-200">
                {block.title}{' '}
                {block.language && (
                  <span className="text-xs font-normal text-cyan-400">({block.language})</span>
                )}
              </h4>
            )}
            <pre className="mt-2 overflow-x-auto rounded-xl bg-[#0d1f17] p-4 text-sm text-green-100">
              <code>{block.code || ''}</code>
            </pre>
            {block.explanation && (
              <p className="mt-2 text-sm text-green-200 italic">{block.explanation}</p>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (key === 'practiceQuestions') {
    return (
      <ol className="space-y-3 pl-4 list-decimal">
        {data.map((q, i) => (
          <li key={i} className="text-green-50 leading-7">
            <span>{typeof q === 'string' ? q : q.question || JSON.stringify(q)}</span>
            {q.hint && (
              <span className="block text-sm text-green-300 italic">💡 Hint: {q.hint}</span>
            )}
          </li>
        ))}
      </ol>
    )
  }

  // Fallback for unknown array types
  if (Array.isArray(data)) {
    return (
      <ul className="space-y-2 pl-4">
        {data.map((item, i) => (
          <li key={i} className="text-green-50">
            {typeof item === 'string' ? item : JSON.stringify(item)}
          </li>
        ))}
      </ul>
    )
  }

  return <MarkdownMessage content={String(data)} variant="board" />
}

function renderSection(key, data) {
  if (!data || (Array.isArray(data) && data.length === 0)) return null
  const config = SECTION_COMPONENTS[key]
  if (!config) return null

  return (
    <div key={key}>
      <SectionHeader {...config} />
      <div className="mt-4">{renderSectionContent(key, data)}</div>
    </div>
  )
}

export default function LessonRenderer({ lesson }) {
  if (!lesson) return null

  const sectionOrder = [
    'overview',
    'learningObjectives',
    'concepts',
    'examples',
    'code',
    'summary',
    'commonMistakes',
    'practiceQuestions',
  ]

  const rendered = sectionOrder
    .map((key) => renderSection(key, lesson[key]))
    .filter(Boolean)

  if (rendered.length === 0) return null

  return <div className="space-y-2">{rendered}</div>
}
