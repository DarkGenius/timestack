import { useTranslation } from 'react-i18next'
import { Button } from './ui/Button'
import { useUIStore } from '../store/uiStore'
import { changeLanguage } from '../i18n'

function Header() {
  const { t, i18n } = useTranslation()
  const { viewMode, setViewMode, openNewTaskDialog, goToToday } = useUIStore()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ru' ? 'en' : 'ru'
    changeLanguage(newLang)
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{t('app.name')}</h1>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`
                px-4 py-1.5 rounded-md text-sm font-medium transition-colors
                ${viewMode === 'calendar' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}
              `}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {t('nav.calendar')}
              </span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`
                px-4 py-1.5 rounded-md text-sm font-medium transition-colors
                ${viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}
              `}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                {t('nav.list')}
              </span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={goToToday}>
            {t('nav.today')}
          </Button>

          <Button size="sm" onClick={() => openNewTaskDialog()}>
            + {t('task.new')}
          </Button>

          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title={t('settings.language')}
          >
            {i18n.language.toUpperCase()}
          </button>
        </div>
      </div>
    </header>
  )
}

export { Header }
