import { useEffect, useMemo, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, Views, SlotInfo } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, addDays, subDays } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import 'react-big-calendar/lib/css/react-big-calendar.css'

import { TaskEvent } from './TaskEvent'
import { useTaskStore } from '../../store/taskStore'
import { useUIStore } from '../../store/uiStore'
import type { Task } from '../../../../shared/types'
import { PRIORITY_COLORS } from '../../../../shared/types'

// Calendar event type
interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: Task
}

function CalendarView() {
  const { i18n } = useTranslation()
  const { tasks, loadTasksByRange } = useTaskStore()
  const { selectedDate, calendarView, setSelectedDate, setCalendarView, openNewTaskDialog, openEditTaskDialog } =
    useUIStore()

  const locale = i18n.language === 'ru' ? ru : enUS

  // Configure localizer
  const localizer = useMemo(
    () =>
      dateFnsLocalizer({
        format,
        parse,
        startOfWeek: () => startOfWeek(new Date(), { locale }),
        getDay,
        locales: { ru, en: enUS }
      }),
    [locale]
  )

  // Load tasks for visible range
  useEffect(() => {
    const date = new Date(selectedDate)
    const start = format(subDays(startOfMonth(date), 7), 'yyyy-MM-dd')
    const end = format(addDays(endOfMonth(date), 7), 'yyyy-MM-dd')
    loadTasksByRange(start, end)
  }, [selectedDate, loadTasksByRange])

  // Convert tasks to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      start: new Date(task.date + 'T00:00:00'),
      end: new Date(task.date + 'T23:59:59'),
      resource: task
    }))
  }, [tasks])

  // Handle slot selection (clicking on a day)
  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      const date = format(slotInfo.start, 'yyyy-MM-dd')
      openNewTaskDialog(date)
    },
    [openNewTaskDialog]
  )

  // Handle event selection (clicking on a task)
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      openEditTaskDialog(event.resource)
    },
    [openEditTaskDialog]
  )

  // Handle navigation
  const handleNavigate = useCallback(
    (date: Date) => {
      setSelectedDate(format(date, 'yyyy-MM-dd'))
    },
    [setSelectedDate]
  )

  // Handle view change
  const handleViewChange = useCallback(
    (view: string) => {
      setCalendarView(view as 'month' | 'week' | 'day' | 'agenda')
    },
    [setCalendarView]
  )

  // Style events based on task color and priority
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const task = event.resource
    return {
      style: {
        backgroundColor: task.color,
        borderLeft: `3px solid ${PRIORITY_COLORS[task.priority]}`,
        color: '#1f2937',
        opacity: task.status === 'completed' ? 0.6 : 1
      }
    }
  }, [])

  // Custom messages for localization
  const messages = useMemo(
    () => ({
      today: i18n.language === 'ru' ? 'Сегодня' : 'Today',
      previous: i18n.language === 'ru' ? 'Назад' : 'Back',
      next: i18n.language === 'ru' ? 'Вперёд' : 'Next',
      month: i18n.language === 'ru' ? 'Месяц' : 'Month',
      week: i18n.language === 'ru' ? 'Неделя' : 'Week',
      day: i18n.language === 'ru' ? 'День' : 'Day',
      agenda: i18n.language === 'ru' ? 'Повестка' : 'Agenda',
      noEventsInRange: i18n.language === 'ru' ? 'Нет задач в этом диапазоне' : 'No tasks in this range'
    }),
    [i18n.language]
  )

  // View map
  const viewMap = {
    month: Views.MONTH,
    week: Views.WEEK,
    day: Views.DAY,
    agenda: Views.AGENDA
  }

  return (
    <div className="h-full bg-white rounded-lg p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        date={new Date(selectedDate)}
        view={viewMap[calendarView]}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable
        eventPropGetter={eventStyleGetter}
        messages={messages}
        culture={i18n.language}
        components={{
          event: TaskEvent
        }}
        style={{ height: '100%' }}
      />
    </div>
  )
}

export { CalendarView }
