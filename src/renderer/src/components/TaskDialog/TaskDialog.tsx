import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { ColorPicker } from './ColorPicker'
import { PrioritySelect } from './PrioritySelect'
import { useTaskStore } from '../../store/taskStore'
import { useUIStore } from '../../store/uiStore'
import type { TaskPriority, CreateTaskInput, UpdateTaskInput } from '../../../../shared/types'

function TaskDialog(): React.JSX.Element {
  const { t } = useTranslation()
  const { isTaskDialogOpen, editingTask, selectedDate, closeTaskDialog } = useUIStore()
  const { createTask, updateTask, deleteTask } = useTaskStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(selectedDate)
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [color, setColor] = useState('#e5e7eb')
  const [estimatedTime, setEstimatedTime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when dialog opens/closes or editing task changes
  useEffect(() => {
    if (isTaskDialogOpen) {
      if (editingTask) {
        setTitle(editingTask.title)
        setDescription(editingTask.description || '')
        setDate(editingTask.date)
        setPriority(editingTask.priority)
        setColor(editingTask.color)
        setEstimatedTime(editingTask.estimated_time?.toString() || '')
      } else {
        setTitle('')
        setDescription('')
        setDate(selectedDate)
        setPriority('normal')
        setColor('#e5e7eb')
        setEstimatedTime('')
      }
    }
  }, [isTaskDialogOpen, editingTask, selectedDate])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)

    try {
      if (editingTask) {
        const updates: UpdateTaskInput = {
          title: title.trim(),
          description: description.trim() || null,
          date,
          priority,
          color,
          estimated_time: estimatedTime ? parseInt(estimatedTime) : null
        }
        await updateTask(editingTask.id, updates)
      } else {
        const input: CreateTaskInput = {
          title: title.trim(),
          description: description.trim() || undefined,
          date,
          priority,
          color,
          estimated_time: estimatedTime ? parseInt(estimatedTime) : undefined
        }
        await createTask(input)
      }
      closeTaskDialog()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (): Promise<void> => {
    if (!editingTask) return

    if (window.confirm(t('confirm.deleteTask'))) {
      setIsSubmitting(true)
      try {
        await deleteTask(editingTask.id)
        closeTaskDialog()
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <Dialog open={isTaskDialogOpen} onClose={closeTaskDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingTask ? t('task.edit') : t('task.new')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('task.title')}
            placeholder={t('task.titlePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />

          <Textarea
            label={t('task.description')}
            placeholder={t('task.descriptionPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <Input
            label={t('task.date')}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <PrioritySelect value={priority} onChange={setPriority} />

          <ColorPicker value={color} onChange={setColor} />

          <Input
            label={`${t('task.estimatedTime')} (${t('task.minutes')})`}
            type="number"
            min="0"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            placeholder="30"
          />

          <DialogFooter>
            {editingTask && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="mr-auto"
              >
                {t('actions.delete')}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={closeTaskDialog}
              disabled={isSubmitting}
            >
              {t('actions.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {t('actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { TaskDialog }
