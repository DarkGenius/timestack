import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTaskStore } from '../../store/taskStore';
import { useUIStore } from '../../store/uiStore';

function ActualTimeDialog(): React.JSX.Element {
  const { t } = useTranslation();
  const { isActualTimeDialogOpen, completingTask, closeActualTimeDialog } = useUIStore();
  const { updateTask } = useTaskStore();

  const [actualTime, setActualTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (isActualTimeDialogOpen && completingTask) {
      setActualTime(completingTask.estimated_time?.toString() || '');
    }
  }, [isActualTimeDialogOpen, completingTask]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!completingTask) return;

    setIsSubmitting(true);
    try {
      await updateTask(completingTask.id, {
        actual_time: actualTime ? parseInt(actualTime) : null
      });
      closeActualTimeDialog();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = (): void => {
    closeActualTimeDialog();
  };

  return (
    <Dialog open={isActualTimeDialogOpen} onClose={closeActualTimeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('confirm.actualTimeTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <p className="text-sm text-gray-600">{t('confirm.actualTimeMessage')}</p>

          <Input
            label={`${t('task.actualTime')} (${t('task.minutes')})`}
            type="number"
            min="0"
            value={actualTime}
            onChange={(e) => setActualTime(e.target.value)}
            placeholder="30"
            autoFocus
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleSkip} disabled={isSubmitting}>
              {t('confirm.skip')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {t('actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { ActualTimeDialog };
