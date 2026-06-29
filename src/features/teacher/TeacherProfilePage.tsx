import { Award, ClipboardList, FileText, Users } from 'lucide-react';

import { useAuth } from '@/app/providers/AuthContext';
import { useMockData } from '@/hooks/useMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/features/shared/components/StatCard';
import { formatNumber, formatPercent } from '@/lib/formatters';

export function TeacherProfilePage() {
  const { user } = useAuth();
  const { teacherStudents, sessions } = useMockData();

  const averageScore = teacherStudents.length
    ? teacherStudents.reduce((sum, student) => sum + student.averageScore, 0) /
      teacherStudents.length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">پروفایل مدرس</h2>
        <p className="text-muted-foreground text-sm">جزئیات وضعیت حرفه‌ای و امتیاز عملکرد شما</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{user?.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="دانش‌آموزان"
            value={formatNumber(teacherStudents.length)}
            icon={<Users className="h-4 w-4 text-emerald-600" />}
          />
          <StatCard
            title="جلسات"
            value={formatNumber(sessions.length)}
            icon={<ClipboardList className="text-primary h-4 w-4" />}
          />
          <StatCard
            title="میانگین نمره"
            value={formatPercent(Number(averageScore.toFixed(0)))}
            icon={<Award className="h-4 w-4 text-amber-600" />}
          />
          <StatCard
            title="امتیاز پرو"
            value="Pro"
            icon={<FileText className="h-4 w-4 text-slate-700" />}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ویژگی‌های پرو</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>نمایش بهینه در جستجو، ارائه لینک‌ تماس، نمونه کار و گزارش عملکرد.</p>
          <ul className="list-disc space-y-2 pr-5">
            <li>پروفایل قابل اشتراک‌گذاری با شاگردان</li>
            <li>دیدگاه‌های SEO برای جذب بیشتر</li>
            <li>امکان بارگذاری فایل‌های آموزشی و نظرات</li>
            <li>اطلاع‌رسانی خودکار به اولیا درباره نتایج</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
