/**
 * Plugin registry for data structure visualizers.
 *
 * Adding a new visualizer:
 * 1. Create a component that accepts { data, options } props
 * 2. Register it: VisualizerRegistry.register('type_name', MyVisualizer)
 * 3. Use it: <VisualizerRegistry.render type="type_name" data={...} />
 */

const registry = new Map()

export const VisualizerRegistry = {
  register(type, component) {
    registry.set(type, component)
  },

  get(type) {
    return registry.get(type) || null
  },

  has(type) {
    return registry.has(type)
  },

  list() {
    return Array.from(registry.keys())
  },

  render({ type, data, options = {} }) {
    const Component = registry.get(type)
    if (!Component) {
      return null
    }
    return <Component data={data} options={options} />
  },
}

export default VisualizerRegistry
