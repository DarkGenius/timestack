import React from 'react'
import { ThemeProvider } from '@gravity-ui/uikit'
import '@gravity-ui/uikit/styles/styles.css'
import { Sidebar } from './components/Sidebar'
import { TaskListView } from './components/TaskList'
import { TaskDialog } from './components/TaskDialog'

function App(): React.JSX.Element {
  return (
    <ThemeProvider theme="light">
      <div className="h-screen flex bg-gray-50 text-gray-900 font-sans">
        <Sidebar />

        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Header can be inside main or Sidebar, keeping it simple for now inside TaskList or just here */}
          <div className="flex-1 overflow-auto p-6">
            <TaskListView />
          </div>
        </main>

        <TaskDialog />
      </div>
    </ThemeProvider>
  )
}

export default App
