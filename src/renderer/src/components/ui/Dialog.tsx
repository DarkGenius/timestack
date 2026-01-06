import React, { ReactNode, useEffect } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: ReactNode;
}

interface DialogTitleProps {
  children: ReactNode;
}

interface DialogFooterProps {
  children: ReactNode;
}

function Dialog({ open, onClose, children }: DialogProps): React.JSX.Element | null {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return (): void => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-50 w-full max-w-lg mx-4 animate-in fade-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
}

function DialogContent({ children, className = '' }: DialogContentProps): React.JSX.Element {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 transition-colors duration-200 ${className}`}
    >
      {children}
    </div>
  );
}

function DialogHeader({ children }: DialogHeaderProps): React.JSX.Element {
  return <div className="mb-4">{children}</div>;
}

function DialogTitle({ children }: DialogTitleProps): React.JSX.Element {
  return <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{children}</h2>;
}

function DialogFooter({ children }: DialogFooterProps): React.JSX.Element {
  return <div className="mt-6 flex justify-end gap-3">{children}</div>;
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter };
