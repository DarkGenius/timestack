import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../store/uiStore';
import { SegmentedRadioGroup, Switch } from '@gravity-ui/uikit';
import { Xmark } from '@gravity-ui/icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';

export const SettingsDialog = (): React.JSX.Element => {
  const { t, i18n } = useTranslation();
  const { isSettingsDialogOpen, closeSettingsDialog, language, setLanguage, theme, setTheme, jumpToDateAfterMove, setJumpToDateAfterMove } =
    useUIStore();

  const handleLanguageChange = (value: string): void => {
    setLanguage(value);
    i18n.changeLanguage(value);
  };

  const handleThemeChange = (value: string): void => {
    setTheme(value as 'light' | 'dark' | 'system');
  };

  return (
    <Dialog open={isSettingsDialogOpen} onClose={closeSettingsDialog}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{t('settings.title')}</DialogTitle>
            <button
              onClick={closeSettingsDialog}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Xmark className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6 my-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('settings.language')}
            </label>
            <SegmentedRadioGroup
              value={language}
              onUpdate={handleLanguageChange}
              options={[
                { value: 'en', content: t('settings.languages.en') },
                { value: 'ru', content: t('settings.languages.ru') }
              ]}
              size="l"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('settings.theme')}
            </label>
            <SegmentedRadioGroup
              value={theme}
              onUpdate={handleThemeChange}
              options={[
                { value: 'light', content: t('settings.themes.light') },
                { value: 'dark', content: t('settings.themes.dark') },
                { value: 'system', content: t('settings.themes.system') }
              ]}
              size="l"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('settings.jumpToDateAfterMove')}
            </label>
            <Switch
              checked={jumpToDateAfterMove}
              onUpdate={setJumpToDateAfterMove}
              size="l"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
