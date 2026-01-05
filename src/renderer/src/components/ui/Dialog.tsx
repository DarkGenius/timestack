import { ReactNode, useEffect } from 'react'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

interface DialogContentProps {
  children: ReactNode
  className?: string
}

interface DialogHeaderProps {
  children: ReactNode
}

interface DialogTitleProps {
  children: ReactNode
}

interface DialogFooterProps {
  children: ReactNode
}

function Dialog({ open, onClose, children }: DialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-50 w-full max-w-lg mx-4 animate-in fade-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  )
}

function DialogContent({ children, className = '' }: DialogContentProps) {
  return (
    <div className={`bg-white rounded-xl shadow-xl p-6 ${className}`}>
      {children}
    </div>
  )
}

function DialogHeader({ children }: DialogHeaderProps) {
  return <div className="mb-4">{children}</div>
}

function DialogTitle({ children }: DialogTitleProps) {
  return <h2 className="text-xl font-semibold text-gray-900">{children}</h2>
}

function DialogFooter({ children }: DialogFooterProps) {
  return <div className="mt-6 flex justify-end gap-3">{children}</div>
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter }
