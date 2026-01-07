import React, { useState } from 'react';
import { Calendar } from '@gravity-ui/date-components';
import { dateTime, DateTime } from '@gravity-ui/date-utils';
import { Gear } from '@gravity-ui/icons';
import { FilterPanel } from './TaskList/FilterPanel';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { Button } from './ui/Button';
import { useTranslation } from 'react-i18next';
import { UserProfile } from './UserProfile';

import logo from '../assets/logo.png';

export const Sidebar = (): React.JSX.Element => {
  const { t, i18n } = useTranslation();
  const {
    selectedDate,
    setSelectedDate,
    openSettingsDialog,
    isTaskDragging,
    draggedTaskId,
    setIsTaskDragging,
    setDraggedTaskId,
    jumpToDateAfterMove
  } = useUIStore();
  const { user, syncStatus } = useAuthStore();
  const { updateTask, loadTasksByDate } = useTaskStore();
  const [isOver, setIsOver] = useState(false);
  const [focusedDate, setFocusedDate] = useState<Date>(new Date(selectedDate));
  const dragCounter = React.useRef(0);
  const highlightedButtonRef = React.useRef<HTMLElement | null>(null);

  const clearDayHighlight = (): void => {
    if (highlightedButtonRef.current) {
      highlightedButtonRef.current.classList.remove('calendar-day-drag-over');
      highlightedButtonRef.current = null;
    }
  };

  const handleDateChange = (value: DateTime): void => {
    setSelectedDate(value.toDate());
    setFocusedDate(value.toDate());
  };

  const handleFocusUpdate = (value: DateTime): void => {
    setFocusedDate(value.toDate());
  };

  const handleDragEnter = (e: React.DragEvent): void => {
    if (isTaskDragging) {
      e.preventDefault();
      dragCounter.current += 1;
      setIsOver(true);
    }
  };

  const handleDragOver = (e: React.DragEvent): void => {
    if (isTaskDragging) {
      e.preventDefault();

      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (element) {
        const button = element.closest('.g-date-calendar__button') as HTMLElement | null;
        if (button !== highlightedButtonRef.current) {
          clearDayHighlight();
          if (button) {
            button.classList.add('calendar-day-drag-over');
            highlightedButtonRef.current = button;
          }
        }
      } else {
        clearDayHighlight();
      }
    }
  };

  const handleDragLeave = (): void => {
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsOver(false);
      clearDayHighlight();
    }
  };

  const handleDrop = async (e: React.DragEvent): Promise<void> => {
    e.preventDefault();
    setIsOver(false);
    clearDayHighlight();
    dragCounter.current = 0;

    const taskId = e.dataTransfer.getData('application/timestack-task-id') || draggedTaskId;

    if (taskId) {
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (element) {
        const button = element.closest('.g-date-calendar__button');
        if (button) {
          const container = button.closest('.g-date-calendar__grid');
          if (container) {
            const buttons = Array.from(container.querySelectorAll('.g-date-calendar__button'));
            const index = buttons.indexOf(button as HTMLElement);

            if (index !== -1) {
              // Calculate the date based on the index in the 6x7 grid
              // Gravity UI Calendar for 'days' mode shows 42 days starting from the start of the week of the first day of the month
              const startOfMonth = dateTime({ input: focusedDate, lang: i18n.language }).startOf(
                'month'
              );
              const startOfGrid = startOfMonth.startOf('week');
              const targetDate = startOfGrid.add({ days: index });

              if (targetDate) {
                const dateStr = targetDate.format('YYYY-MM-DD');
                await updateTask(taskId, { date: dateStr });

                if (jumpToDateAfterMove) {
                  setSelectedDate(targetDate.toDate());
                  await loadTasksByDate(dateStr);
                } else {
                  // Refresh the current view
                  await loadTasksByDate(dateTime({ input: selectedDate }).format('YYYY-MM-DD'));
                }
              }
            }
          }
        }
      }
    }

    setIsTaskDragging(false);
    setDraggedTaskId(null);
  };

  const currentDate = dateTime({ input: selectedDate, lang: i18n.language });
  const currentFocusedDate = dateTime({ input: focusedDate, lang: i18n.language });

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col p-4 transition-colors duration-200">
      <div className="mb-6 flex items-center gap-4">
        <img src={logo} alt="TimeStack" className="w-12 h-12 object-contain" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">TimeStack</h1>
      </div>

      <div
        className={`flex justify-center rounded-xl p-2 transition-colors duration-300 ${isOver ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 ring-dashed' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Calendar
          value={currentDate}
          onUpdate={handleDateChange}
          focusedValue={currentFocusedDate}
          onFocusUpdate={handleFocusUpdate}
          size="l"
        />
      </div>

      <div className="mt-8 flex-1 px-2">
        <FilterPanel />
      </div>

      <div className="mt-auto pt-4 flex flex-col gap-2 border-t border-gray-100 dark:border-gray-700">
        <UserProfile user={user} syncStatus={syncStatus} />

        <Button
          variant="ghost"
          className="w-full justify-start text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          onClick={openSettingsDialog}
        >
          <Gear className="w-5 h-5 mr-3" />
          {t('settings.title')}
        </Button>
      </div>
    </div>
  );
};
