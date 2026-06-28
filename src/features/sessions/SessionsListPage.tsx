import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useMockData, useStudentName } from '@/hooks/useMockData';
import { SessionForm } from '@/features/teacher/components/SessionForm';
import { SessionsTable } from '@/features/shared/components/SessionsTable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/app/providers/AuthContext';

export function SessionsListPage() {
  const { user } = useAuth();
  const { sessions, teacherStudents } = useMockData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [studentFilter, setStudentFilter] = useState<string>('all');

  const isTeacher = user?.role === 'teacher';
  const activeTab = searchParams.get('tab') === 'new' && isTeacher ? 'new' : 'list';

  const filteredSessions = useMemo(() => {
    if (studentFilter === 'all') return sessions;
    return sessions.filter((session) => session.studentId === studentFilter);
  }, [sessions, studentFilter]);

  const showStudent = isTeacher;
  const showConfirmation = user?.role === 'parent';

  const handleTabChange = (value: string) => {
    if (value === 'new') {
      setSearchParams({ tab: 'new' });
      return;
    }
    setSearchParams({});
  };

  const sessionsTable = (
    <SessionsTable
      sessions={filteredSessions}
      showStudent={showStudent}
      showConfirmation={showConfirmation}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">لیست جلسات</h2>
          <p className="text-muted-foreground text-sm">
            {user?.role === 'parent'
              ? 'گزارش کامل جلسات فرزند'
              : isTeacher
                ? 'مشاهده و ثبت جلسات زبان‌آموزان'
                : 'تاریخچه جلسات آموزشی'}
          </p>
        </div>
        {isTeacher && activeTab !== 'new' && (
          <Select value={studentFilter} onValueChange={setStudentFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="فیلتر زبان‌آموز" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه زبان‌آموزان</SelectItem>
              {teacherStudents.map((student) => (
                <SelectItem key={student.userId} value={student.userId}>
                  <StudentOption userId={student.userId} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {isTeacher ? (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="list">لیست جلسات</TabsTrigger>
            <TabsTrigger value="new">ثبت جلسه</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            {sessionsTable}
          </TabsContent>

          <TabsContent value="new" className="mt-4">
            <SessionForm />
          </TabsContent>
        </Tabs>
      ) : (
        sessionsTable
      )}
    </div>
  );
}

function StudentOption({ userId }: { userId: string }) {
  const name = useStudentName(userId);
  return <>{name}</>;
}
