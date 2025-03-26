import GraphCanvas from '../../components/GraphCanvas'
import ControlPanel from '../../components/ControlPanel'

export default function GraphPage() {
  return (
      <div className="flex flex-col h-screen">
        <ControlPanel />
        <div className="flex-1">
          <GraphCanvas />
        </div>
      </div>
  )
}
