/**
 * Base visualizer component.
 * All visualizers should follow this interface.
 *
 * Props:
 *   data - The data to visualize (format depends on visualizer type)
 *   options - Configuration options { animated, speed, theme, ... }
 */
export default function BaseVisualizer({ data, options = {} }) {
  return (
    <div className="rounded-xl border border-green-primary/10 bg-cream/50 p-6 text-center">
      <p className="text-sm font-bold text-gray-400">Visualizer</p>
      <p className="mt-2 text-xs text-gray-500">
        This visualization type will be available in a future update.
      </p>
      {data && (
        <pre className="mt-4 overflow-x-auto rounded-lg bg-gray-100 p-4 text-left text-xs text-gray-600">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}
