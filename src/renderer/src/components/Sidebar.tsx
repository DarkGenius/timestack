import React from 'react'
import { Calendar } from '@gravity-ui/date-components'
import { dateTime, DateTime } from '@gravity-ui/date-utils'
import { FilterPanel } from './TaskList/FilterPanel'
import { useUIStore } from '../store/uiStore'

export const Sidebar = (): React.JSX.Element => {
  const { selectedDate, setSelectedDate } = useUIStore()

  const handleDateChange = (value: DateTime): void => {
    setSelectedDate(value.toDate())
  }

  const currentDate = dateTime({ input: selectedDate })

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">TimeStack</h1>
      </div>

      <div className="flex justify-center">
        <Calendar value={currentDate} onUpdate={handleDateChange} size="l" />
      </div>

      <div className="mt-8 flex-1 px-2">
        <FilterPanel />
      </div>
    </div>
  )
}
