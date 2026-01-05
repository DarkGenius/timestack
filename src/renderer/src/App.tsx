import { Header } from './components/Header'
import { CalendarView } from './components/Calendar'
import { TaskListView } from './components/TaskList'
import { TaskDialog } from './components/TaskDialog'
import { useUIStore } from './store/uiStore'

function App(): React.JSX.Element {
  const { viewMode } = useUIStore()

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 overflow-hidden p-6">
        {viewMode === 'calendar' ? <CalendarView /> : <TaskListView />}
      </main>

      <TaskDialog />
    </div>
  )
}

export default App
