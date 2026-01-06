import React from 'react';
import { useTranslation } from 'react-i18next';
import { TASK_COLORS } from '../../../../shared/types';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

function ColorPicker({ value, onChange }: ColorPickerProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'ru' | 'en';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{t('task.color')}</label>
      <div className="flex flex-wrap gap-2">
        {TASK_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={`
              w-8 h-8 rounded-full transition-all
              ${value === color.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}
            `}
            style={{ backgroundColor: color.value }}
            title={color.label[lang]}
          />
        ))}
      </div>
    </div>
  );
}

export { ColorPicker };
