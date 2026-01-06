import React from 'react';
import { Calendar } from '@gravity-ui/date-components';
import { dateTime, DateTime } from '@gravity-ui/date-utils';
import { Gear } from '@gravity-ui/icons';
import { FilterPanel } from './TaskList/FilterPanel';
import { useUIStore } from '../store/uiStore';
import { Button } from './ui/Button';
import { useTranslation } from 'react-i18next';

import logo from '../assets/logo.png';

export const Sidebar = (): React.JSX.Element => {
  const { t } = useTranslation();
  const { selectedDate, setSelectedDate, openSettingsDialog } = useUIStore();

  const handleDateChange = (value: DateTime): void => {
    setSelectedDate(value.toDate());
  };

  const currentDate = dateTime({ input: selectedDate });

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col p-4 transition-colors duration-200">
      <div className="mb-6 flex items-center gap-4">
        <img src={logo} alt="TimeStack" className="w-12 h-12 object-contain" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">TimeStack</h1>
      </div>

      <div className="flex justify-center">
        <Calendar value={currentDate} onUpdate={handleDateChange} size="l" />
      </div>

      <div className="mt-8 flex-1 px-2">
        <FilterPanel />
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
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
