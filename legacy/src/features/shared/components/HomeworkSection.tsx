import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { Homework, HomeworkTask } from '@/types';

import { useHomework } from '@/app/providers/HomeworkContext';
import { HomeworkTaskEditor } from '@/features/shared/components/HomeworkTaskEditor';
import { ScoreBadge } from '@/features/shared/components/ScoreBadge';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { formatNumber, formatPercent } from '@/lib/formatters';
import { useAuth } from '@/app/providers/AuthContext';

interface HomeworkSectionProps {
  sessionId: string;
  studentId: string;
  homework: Homework;
}

export function HomeworkSection({ sessionId, studentId, homework }: HomeworkSectionProps) {
  const { user } = useAuth();
  const { getTasks, saveTasks, isTaskCompleted, setTaskCompleted, getSummary } = useHomework();

  const defaultTasks = homework.tasks;
  const tasks = getTasks(sessionId, defaultTasks);
  const summary = getSummary(sessionId, studentId, tasks);

  const isStudent = user?.role === 'student' && user.id === studentId;
  const isTeacher = user?.role === 'teacher';
  const isReadOnlyViewer = user?.role === 'parent' || (user?.role === 'student' && !isStudent);

  const [editingTasks, setEditingTasks] = useState<HomeworkTask[] | null>(null);
  const editorTasks = editingTasks ?? tasks;

  const statusVariant = useMemo(() => {
    if (tasks.length === 0) return 'secondary' as const;
    return summary.allDone ? ('success' as const) : ('warning' as const);
  }, [summary.allDone, tasks.length]);

  const statusLabel = useMemo(() => {
    if (tasks.length === 0) return 'بدون تکلیف';
    return summary.allDone
      ? 'همه انجام شده'
      : `${formatNumber(summary.completed)} از ${formatNumber(summary.total)} انجام شده`;
  }, [summary, tasks.length]);

  const handleToggle = (taskId: string, checked: boolean) => {
    if (!isStudent) return;
    setTaskCompleted(sessionId, studentId, taskId, checked);
    toast.success(checked ? 'تکلیف انجام‌شده علامت خورد' : 'علامت انجام برداشته شد');
  };

  const handleSaveTasks = (tasksToSave: HomeworkTask[]) => {
    saveTasks(sessionId, tasksToSave);
    setEditingTasks(null);
    toast.success('موارد تکلیف ذخیره شد');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">تکلیف (۴۰٪)</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant={statusVariant}>{statusLabel}</Badge>
            {tasks.length > 0 && (
              <Badge variant="outline">{formatPercent(summary.rate)} پیشرفت</Badge>
            )}
            <ScoreBadge score={homework.score} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium">{homework.title}</p>
          <p className="text-muted-foreground mt-1 text-sm">{homework.description}</p>
        </div>

        {isTeacher ? (
          <div className="space-y-6">
            <HomeworkTaskEditor
              tasks={editorTasks}
              onChange={setEditingTasks}
              onSave={handleSaveTasks}
            />
            {tasks.length > 0 && (
              <div className="bg-muted/30 space-y-3 rounded-lg border p-4">
                <p className="text-sm font-medium">وضعیت انجام توسط زبان‌آموز</p>
                <ul className="space-y-2">
                  {tasks.map((task) => {
                    const checked = isTaskCompleted(sessionId, studentId, task.id);
                    return (
                      <li key={task.id} className="flex items-center gap-3 text-sm">
                        <Checkbox checked={checked} disabled />
                        <span className={checked ? 'text-muted-foreground line-through' : ''}>
                          {task.title}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        ) : tasks.length > 0 ? (
          <ul className="space-y-3">
            {tasks.map((task) => {
              const checked = isTaskCompleted(sessionId, studentId, task.id);
              return (
                <li key={task.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <Checkbox
                    id={task.id}
                    checked={checked}
                    disabled={!isStudent}
                    onCheckedChange={(value) => handleToggle(task.id, value === true)}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={task.id}
                      className={`cursor-pointer text-sm leading-relaxed font-normal ${
                        checked ? 'text-muted-foreground line-through' : ''
                      } ${!isStudent ? 'cursor-default' : ''}`}
                    >
                      {task.title}
                    </Label>
                    {isReadOnlyViewer && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        {checked ? 'انجام شده' : 'انجام نشده'}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">تکلیفی برای این جلسه تعریف نشده است.</p>
        )}

        {isStudent && tasks.length > 0 && (
          <p className="text-muted-foreground text-xs">
            با تیک زدن هر مورد، انجام تکلیف را به مدرس اعلام کنید.
          </p>
        )}

        <p className="text-sm">{homework.teacherNote}</p>
      </CardContent>
    </Card>
  );
}
