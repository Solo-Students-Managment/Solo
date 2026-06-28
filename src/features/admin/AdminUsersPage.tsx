import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { StudentProfile, User } from '@/types';
import { useStudents } from '@/app/providers/StudentContext';
import { STUDENT_LEVELS } from '@/lib/studentStore';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TabRole = 'teacher' | 'student' | 'parent';

interface UserFormState {
  id?: string;
  name: string;
  username: string;
  level: string;
  teacherId: string;
  parentId: string;
  sessionsRemaining: string;
}

const emptyForm = (): UserFormState => ({
  name: '',
  username: '',
  level: STUDENT_LEVELS[0],
  teacherId: '',
  parentId: '',
  sessionsRemaining: '20',
});

export function AdminUsersPage() {
  const {
    getUsersByRole,
    students,
    createTeacher,
    createParent,
    addStudent,
    updateUser,
    deleteUser,
    updateStudent,
    deleteStudent,
    getStudentsByParentId,
    getStudentsByTeacherId,
  } = useStudents();

  const [tab, setTab] = useState<TabRole>('teacher');
  const [form, setForm] = useState<UserFormState | null>(null);

  const teachers = getUsersByRole('teacher');
  const parents = getUsersByRole('parent');
  const studentUsers = getUsersByRole('student');

  const studentRows = useMemo(
    () =>
      studentUsers.map((user) => ({
        user,
        profile: students.find((student) => student.userId === user.id),
      })),
    [studentUsers, students]
  );

  const openCreate = () => setForm(emptyForm());
  const openEdit = (user: User, profile?: StudentProfile) => {
    setForm({
      id: user.id,
      name: user.name,
      username: user.username,
      level: profile?.level ?? STUDENT_LEVELS[0],
      teacherId: profile?.teacherId ?? teachers[0]?.id ?? '',
      parentId: profile?.parentId ?? parents[0]?.id ?? '',
      sessionsRemaining: String(profile?.sessionsRemaining ?? 20),
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;

    try {
      if (tab === 'teacher') {
        if (form.id) {
          updateUser(form.id, { name: form.name, username: form.username });
          toast.success('مدرس به‌روزرسانی شد');
        } else {
          createTeacher({ name: form.name, username: form.username });
          toast.success('مدرس جدید اضافه شد');
        }
      } else if (tab === 'parent') {
        if (form.id) {
          updateUser(form.id, { name: form.name, username: form.username });
          toast.success('ولی به‌روزرسانی شد');
        } else {
          createParent({ name: form.name, username: form.username });
          toast.success('ولی جدید اضافه شد');
        }
      } else if (form.id) {
        updateUser(form.id, { name: form.name, username: form.username });
        updateStudent(form.id, {
          level: form.level,
          teacherId: form.teacherId,
          parentId: form.parentId,
          sessionsRemaining: Number(form.sessionsRemaining) || 20,
        });
        toast.success('زبان‌آموز به‌روزرسانی شد');
      } else {
        addStudent({
          name: form.name,
          username: form.username,
          level: form.level,
          teacherId: form.teacherId,
          parentId: form.parentId,
          sessionsRemaining: Number(form.sessionsRemaining) || 20,
        });
        toast.success('زبان‌آموز جدید اضافه شد');
      }
      setForm(null);
    } catch (error) {
      if (error instanceof Error && error.message === 'duplicate_username') {
        toast.error('نام کاربری تکراری است');
        return;
      }
      toast.error('خطا در ذخیره اطلاعات');
    }
  };

  const handleDelete = (user: User) => {
    try {
      if (user.role === 'student') {
        deleteStudent(user.id);
      } else {
        deleteUser(user.id);
      }
      toast.success('حذف شد');
    } catch {
      toast.error('امکان حذف این کاربر وجود ندارد');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">مدیریت کاربران</h2>
          <p className="text-muted-foreground text-sm">
            افزودن، ویرایش و حذف مدرسان، زبان‌آموزان و اولیا
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          افزودن
        </Button>
      </div>

      {form && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {form.id ? 'ویرایش' : 'افزودن'}{' '}
              {tab === 'teacher' ? 'مدرس' : tab === 'parent' ? 'ولی' : 'زبان‌آموز'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">نام</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">نام کاربری</Label>
                <Input
                  id="username"
                  dir="ltr"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              {tab === 'student' && (
                <>
                  <div className="space-y-2">
                    <Label>سطح</Label>
                    <Select
                      value={form.level}
                      onValueChange={(v) => setForm({ ...form, level: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STUDENT_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>مدرس</Label>
                    <Select
                      value={form.teacherId}
                      onValueChange={(v) => setForm({ ...form, teacherId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب مدرس" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ولی</Label>
                    <Select
                      value={form.parentId}
                      onValueChange={(v) => setForm({ ...form, parentId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب ولی" />
                      </SelectTrigger>
                      <SelectContent>
                        {parents.map((parent) => (
                          <SelectItem key={parent.id} value={parent.id}>
                            {parent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionsRemaining">جلسات باقی‌مانده</Label>
                    <Input
                      id="sessionsRemaining"
                      type="number"
                      min={0}
                      value={form.sessionsRemaining}
                      onChange={(e) => setForm({ ...form, sessionsRemaining: e.target.value })}
                    />
                  </div>
                </>
              )}
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit">ذخیره</Button>
                <Button type="button" variant="outline" onClick={() => setForm(null)}>
                  انصراف
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as TabRole);
          setForm(null);
        }}
      >
        <TabsList>
          <TabsTrigger value="teacher">مدرسان ({teachers.length})</TabsTrigger>
          <TabsTrigger value="student">زبان‌آموزان ({studentUsers.length})</TabsTrigger>
          <TabsTrigger value="parent">اولیا ({parents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="teacher" className="mt-4">
          <UserTable
            users={teachers}
            extraColumn={(user) =>
              formatNumber(getStudentsByTeacherId(user.id).length) + ' زبان‌آموز'
            }
            extraLabel="کلاس"
            onEdit={(user) => openEdit(user)}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="student" className="mt-4">
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام</TableHead>
                  <TableHead>نام کاربری</TableHead>
                  <TableHead>سطح</TableHead>
                  <TableHead>مدرس</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentRows.map(({ user, profile }) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell dir="ltr">{user.username}</TableCell>
                    <TableCell>{profile?.level ?? '—'}</TableCell>
                    <TableCell>
                      {teachers.find((t) => t.id === profile?.teacherId)?.name ?? '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(user, profile)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(user)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="parent" className="mt-4">
          <UserTable
            users={parents}
            extraColumn={(user) => formatNumber(getStudentsByParentId(user.id).length) + ' فرزند'}
            extraLabel="فرزندان"
            onEdit={(user) => openEdit(user)}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('fa-IR').format(n);
}

function UserTable({
  users,
  extraColumn,
  extraLabel,
  onEdit,
  onDelete,
}: {
  users: User[];
  extraColumn: (user: User) => string;
  extraLabel: string;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>نام</TableHead>
            <TableHead>نام کاربری</TableHead>
            <TableHead>{extraLabel}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell dir="ltr">{user.username}</TableCell>
              <TableCell>
                <Badge variant="secondary">{extraColumn(user)}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(user)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onDelete(user)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
