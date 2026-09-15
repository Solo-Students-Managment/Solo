import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { useStudents } from '@/app/providers/StudentContext';
import { STUDENT_LEVELS } from '@/lib/studentStore';
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
import { useAuth } from '@/app/providers/AuthContext';

export function StudentCreatePage() {
  const { user } = useAuth();
  const { addStudent } = useStudents();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [level, setLevel] = useState<string>(STUDENT_LEVELS[0]);
  const [username, setUsername] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentUsername, setParentUsername] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [sessionsRemaining, setSessionsRemaining] = useState('20');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!user || user.role !== 'teacher') return;

    if (!name.trim() || !username.trim()) {
      toast.error('نام و نام کاربری زبان‌آموز الزامی است');
      return;
    }

    try {
      const result = addStudent({
        name,
        level,
        username,
        parentName: parentName.trim() || undefined,
        parentUsername: parentUsername.trim() || undefined,
        teacherId: user.id,
        sessionsRemaining: Number(sessionsRemaining) || 20,
      });

      toast.success(
        `زبان‌آموز «${result.user.name}» اضافه شد. لینک ورود ماک برای ${studentPhone || username} آماده است. رمز: ${result.defaultPassword}`
      );
      navigate('/dashboard/students');
    } catch (error) {
      if (error instanceof Error && error.message === 'duplicate_username') {
        toast.error('این نام کاربری قبلاً ثبت شده است');
        return;
      }
      if (error instanceof Error && error.message === 'duplicate_parent_username') {
        toast.error('نام کاربری ولی تکراری است');
        return;
      }
      toast.error('خطا در ثبت زبان‌آموز');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/students">
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-xl font-semibold">افزودن زبان‌آموز</h2>
          <p className="text-muted-foreground text-sm">اطلاعات زبان‌آموز جدید را وارد کنید</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">اطلاعات زبان‌آموز</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">نام و نام خانوادگی</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="مثلاً علی رضایی"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">سطح</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger id="level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STUDENT_LEVELS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">نام کاربری (ایمیل)</Label>
              <Input
                id="username"
                type="email"
                dir="ltr"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="student@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentPhone">شماره موبایل زبان‌آموز</Label>
              <Input
                id="studentPhone"
                dir="ltr"
                value={studentPhone}
                onChange={(event) => setStudentPhone(event.target.value)}
                placeholder="09xxxxxxxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionsRemaining">تعداد جلسات باقی‌مانده</Label>
              <Input
                id="sessionsRemaining"
                type="number"
                min={0}
                value={sessionsRemaining}
                onChange={(event) => setSessionsRemaining(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">اطلاعات ولی (اختیاری)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parentName">نام ولی</Label>
              <Input
                id="parentName"
                value={parentName}
                onChange={(event) => setParentName(event.target.value)}
                placeholder="مثلاً مریم رضایی"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentUsername">نام کاربری ولی (ایمیل)</Label>
              <Input
                id="parentUsername"
                type="email"
                dir="ltr"
                value={parentUsername}
                onChange={(event) => setParentUsername(event.target.value)}
                placeholder="parent@example.com"
                disabled={!parentName.trim()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentPhone">شماره موبایل ولی</Label>
              <Input
                id="parentPhone"
                dir="ltr"
                value={parentPhone}
                onChange={(event) => setParentPhone(event.target.value)}
                placeholder="09xxxxxxxxx"
                disabled={!parentName.trim()}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link to="/dashboard/students">انصراف</Link>
          </Button>
          <Button type="submit">ثبت زبان‌آموز</Button>
        </div>
      </form>
    </div>
  );
}
