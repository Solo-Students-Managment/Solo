import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { HomeworkTask } from '@/types'
import { createTaskId } from '@/lib/homework'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface HomeworkTaskEditorProps {
  tasks: HomeworkTask[]
  onChange: (tasks: HomeworkTask[]) => void
  onSave?: (tasks: HomeworkTask[]) => void
}

export function HomeworkTaskEditor({ tasks, onChange, onSave }: HomeworkTaskEditorProps) {
  const addTask = () => {
    onChange([...tasks, { id: createTaskId(), title: '' }])
  }

  const updateTask = (taskId: string, title: string) => {
    onChange(tasks.map((task) => (task.id === taskId ? { ...task, title } : task)))
  }

  const removeTask = (taskId: string) => {
    onChange(tasks.filter((task) => task.id !== taskId))
  }

  const handleSave = () => {
    const validTasks = tasks.filter((task) => task.title.trim())
    if (validTasks.length === 0) {
      toast.error('حداقل یک مورد تکلیف وارد کنید')
      return
    }
    onChange(validTasks)
    onSave?.(validTasks)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>موارد تکلیف</Label>
        <Button type="button" variant="outline" size="sm" onClick={addTask}>
          <Plus className="h-4 w-4" />
          افزودن مورد
        </Button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">هنوز مورد تکلیفی تعریف نشده است.</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task, index) => (
            <li key={task.id} className="flex items-center gap-3">
              <Checkbox checked disabled aria-hidden />
              <Input
                value={task.title}
                onChange={(event) => updateTask(task.id, event.target.value)}
                placeholder={`مورد ${index + 1} — مثال: تمرین گرامر فصل ۵`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTask(task.id)}
                aria-label="حذف مورد"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {onSave && (
        <Button type="button" onClick={handleSave}>
          ذخیره موارد تکلیف
        </Button>
      )}
    </div>
  )
}
