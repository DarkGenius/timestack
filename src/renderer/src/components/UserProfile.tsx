import React from 'react';
import { useTranslation } from 'react-i18next';
import { useToaster } from '@gravity-ui/uikit';
import { ArrowRightFromSquare, ArrowRotateLeft } from '@gravity-ui/icons';
import { Button } from './ui/Button';
import { GoogleIcon } from './ui';
import { signInWithGoogle, logout as firebaseLogout } from '../services/firebase';

interface UserProfileProps {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  } | null;
  syncStatus: 'synced' | 'syncing' | 'none' | 'error';
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, syncStatus }) => {
  const { t } = useTranslation();
  const { add: addToast } = useToaster();

  const handleSignIn = async (): Promise<void> => {
    try {
      await signInWithGoogle();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('auth.signInError');
      console.error('Sign in failed:', error);
      addToast({
        name: 'auth-error',
        title: t('auth.signInError'),
        content: message,
        theme: 'danger',
        autoHiding: 5000
      });
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await firebaseLogout();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('auth.logoutError');
      console.error('Logout failed:', error);
      addToast({
        name: 'logout-error',
        title: t('auth.logoutError'),
        content: message,
        theme: 'danger',
        autoHiding: 5000
      });
    }
  };

  const getSyncStatusClass = (): string => {
    switch (syncStatus) {
      case 'synced':
        return 'text-green-500';
      case 'syncing':
        return 'text-blue-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getSyncStatusText = (): string => {
    switch (syncStatus) {
      case 'synced':
        return t('sync.synced');
      case 'syncing':
        return t('sync.syncing');
      case 'error':
        return t('sync.error');
      default:
        return t('sync.none');
    }
  };

  if (!user) {
    return (
      <Button
        variant="outline"
        className="w-full mb-2 justify-center border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        onClick={handleSignIn}
      >
        <GoogleIcon className="w-4 h-4 mr-2" />
        {t('auth.login')}
      </Button>
    );
  }

  return (
    <div className="mb-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
            {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <div className="overflow-hidden">
          <p className="text-sm font-medium truncate">
            {user.displayName || user.email || t('auth.anonymous')}
          </p>
          <div className="flex items-center gap-1">
            <span className={`text-[10px] uppercase font-bold ${getSyncStatusClass()}`}>
              {getSyncStatusText()}
            </span>
            {syncStatus === 'syncing' && (
              <ArrowRotateLeft className="w-3 h-3 animate-spin text-blue-500" />
            )}
          </div>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        title={t('auth.logout')}
        aria-label={t('auth.logout')}
      >
        <ArrowRightFromSquare className="w-4 h-4" />
      </button>
    </div>
  );
};
