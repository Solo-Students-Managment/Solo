import { useState } from 'react';
import { toast } from 'sonner';
import type { HomeworkTask } from '@/types';
import { useHomework } from '@/contexts/HomeworkContext';
import { useSessionScore } from '@/contexts/SessionScoreContext';
import { clampSessionScore } from '@/lib/sessionScore';
import { useMockData, useStudentName } from '@/hooks/useMockData';
import { createTaskId } from '@/lib/homework';
import { HomeworkTaskEditor } from '@/components/shared/HomeworkTaskEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DEFAULT_HOMEWORK_TASKS: HomeworkTask[] = [
  { id: createTaskId(), title: 'تمرین گرامر' },
  { id: createTaskId(), title: 'مرور واژگان' },
];

export function SessionForm() {
  const { teacherStudents } = useMockData();
  const { saveTasks } = useHomework();
  const { setScore } = useSessionScore();
  const [studentId, setStudentId] = useState(teacherStudents[0]?.userId ?? '');
  const [homeworkTasks, setHomeworkTasks] = useState<HomeworkTask[]>(DEFAULT_HOMEWORK_TASKS);
  const [sessionScore, setSessionScore] = useState('16');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validTasks = homeworkTasks.filter((task) => task.title.trim());
    if (validTasks.length === 0) {
      toast.error('حداقل یک مورد تکلیف تعریف کنید');
      return;
    }

    const draftSessionId = `session-draft-${Date.now()}`;
    saveTasks(draftSessionId, validTasks);
    setScore(draftSessionId, clampSessionScore(Number(sessionScore)));
    toast.success('جلسه با موفقیت ثبت شد (نمایشی — تکلیف و نمره ذخیره شد)');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">اطلاعات پایه</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>زبان‌آموز</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teacherStudents.map((student) => (
                  <SelectItem key={student.userId} value={student.userId}>
                    <StudentLabel userId={student.userId} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">تاریخ</Label>
            <Input id="date" type="date" defaultValue="2025-04-26" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="topic">موضوع جلسه</Label>
            <Input id="topic" placeholder="مثال: Future Tenses" />
          </div>
          <div className="space-y-2">
            <Label>وضعیت حضور</Label>
            <Select defaultValue="present">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">حاضر</SelectItem>
                <SelectItem value="absent">غایب</SelectItem>
                <SelectItem value="late">تأخیر</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="session-score">نمره جلسه (۰ تا ۲۰)</Label>
            <Input
              id="session-score"
              type="number"
              min={0}
              max={20}
              step={0.5}
              value={sessionScore}
              onChange={(event) => setSessionScore(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="homework">
        <TabsList className="flex-wrap">
          <TabsTrigger value="homework">تکلیف</TabsTrigger>
          <TabsTrigger value="participation">مشارکت</TabsTrigger>
          <TabsTrigger value="speaking">اسپیکینگ</TabsTrigger>
          <TabsTrigger value="evaluation">ارزیابی</TabsTrigger>
        </TabsList>

        <TabsContent value="homework">
          <Card>
            <CardContent className="pt-6">
              <HomeworkTaskEditor tasks={homeworkTasks} onChange={setHomeworkTasks} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participation">
          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>مشارکت</Label>
                <Select defaultValue="yes">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">بله</SelectItem>
                    <SelectItem value="no">خیر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="part-score">نمره مشارکت</Label>
                <Input id="part-score" type="number" min={0} max={20} defaultValue={15} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="speaking">
          <Card>
            <CardContent className="grid gap-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="speak-q">سوالات اسپیکینگ</Label>
                <Input id="speak-q" placeholder="Describe your daily routine" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="speak-score">نمره اسپیکینگ</Label>
                <Input id="speak-score" type="number" min={0} max={20} defaultValue={14} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="speak-feedback">بازخورد</Label>
                <Input id="speak-feedback" placeholder="بازخورد مدرس" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation">
          <Card>
            <CardContent className="grid gap-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="strengths">نقاط قوت</Label>
                <Input id="strengths" placeholder="واژگان خوب، تمرین منظم" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weaknesses">نقاط ضعف</Label>
                <Input id="weaknesses" placeholder="گرامر زمان‌ها" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recommendation">پیشنهاد جلسه بعد</Label>
                <Input id="recommendation" placeholder="تمرین مکالمه" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eval-score">نمره ارزیابی</Label>
                <Input id="eval-score" type="number" min={0} max={20} defaultValue={16} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit">ثبت جلسه</Button>
      </div>
    </form>
  );
}

function StudentLabel({ userId }: { userId: string }) {
  const name = useStudentName(userId);
  return <>{name}</>;
}
