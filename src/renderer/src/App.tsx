import React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';
import '@gravity-ui/uikit/styles/styles.css';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './components/Sidebar';
import { TaskListView } from './components/TaskList';
import { TaskDialog, ActualTimeDialog } from './components/TaskDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { useUIStore } from './store/uiStore';
import { onAuthStateChanged, auth } from './services/firebase';

function App(): React.JSX.Element {
  const { theme, language } = useUIStore();
  const { i18n } = useTranslation();

  // Sync language on mount
  React.useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  const [systemTheme, setSystemTheme] = React.useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent): void => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const activeTheme = theme === 'system' ? systemTheme : theme;

  React.useEffect(() => {
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [activeTheme]);

  // Auth & Sync Initialization
  const { setUser, setSyncStatus, neonConnectionString } = useUIStore();
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        };
        setUser(userData);

        // Notify Main Process and trigger initial sync
        setSyncStatus('syncing');
        try {
          await window.api.auth.setSession(firebaseUser.uid, neonConnectionString);
          setSyncStatus('synced');
        } catch (error) {
          console.error('Auth sync failed:', error);
          setSyncStatus('error');
        }
      } else {
        setUser(null);
        setSyncStatus('none');
        await window.api.auth.setSession(null, null);
      }
    });

    return () => unsubscribe();
  }, [setUser, setSyncStatus, neonConnectionString]);

  return (
    <ThemeProvider theme={activeTheme}>
      <div className="h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
        <Sidebar />

        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Header can be inside main or Sidebar, keeping it simple for now inside TaskList or just here */}
          <div className="flex-1 overflow-auto p-6">
            <TaskListView />
          </div>
        </main>

        <TaskDialog />
        <ActualTimeDialog />
        <SettingsDialog />
      </div>
    </ThemeProvider>
  );
}

export default App;
