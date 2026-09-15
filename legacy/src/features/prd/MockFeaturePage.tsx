import { useMemo, useState } from 'react';
import {
  Bell,
  BookCopy,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  LockKeyhole,
  MessageSquareText,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/app/providers/AuthContext';
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
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, formatPersianDateTime } from '@/lib/formatters';
import {
  addMockRecord,
  deleteMockRecord,
  readMockRecords,
  seedRecord,
  STATUS_LABELS,
  updateMockRecordStatus,
  type MockRecord,
  type MockRecordStatus,
} from '@/lib/prdMockStore';

type FeatureKind =
  | 'otp'
  | 'onboarding'
  | 'subjects'
  | 'availability'
  | 'calendar'
  | 'lesson-plans'
  | 'files'
  | 'notifications'
  | 'sms'
  | 'payments'
  | 'certificates'
  | 'question-bank'
  | 'grading'
  | 'semesters'
  | 'permissions'
  | 'profile-approvals'
  | 'public-profile'
  | 'articles'
  | 'all-chats'
  | 'bans';

interface FeatureConfig {
  scope: string;
  title: string;
  description: string;
  addLabel: string;
  titleLabel: string;
  subtitleLabel: string;
  icon: typeof CalendarDays;
  seed: MockRecord[];
  amountMode?: boolean;
  longText?: boolean;
}

const configs: Record<FeatureKind, FeatureConfig> = {
  otp: {
    scope: 'otp-links',
    title: 'ورود و ثبت‌نام OTP',
    description: 'ماک لینک ورود، شماره موبایل، و وضعیت تأیید پیامکی برای نقش‌های مختلف.',
    addLabel: 'ساخت لینک ورود',
    titleLabel: 'شماره موبایل',
    subtitleLabel: 'نقش یا توضیح',
    icon: LockKeyhole,
    seed: [
      seedRecord('otp-links', 1, '09120000000', 'لینک ورود زبان‌آموز - منقضی نشده', 'student'),
      seedRecord(
        'otp-links',
        2,
        '09350000000',
        'ثبت‌نام مدرس با آدرس اجباری',
        'teacher',
        'pending'
      ),
    ],
  },
  onboarding: {
    scope: 'teacher-onboarding',
    title: 'تکمیل ثبت‌نام مدرس و Trial',
    description: 'چک‌لیست ثبت‌نام، فعال‌سازی ۱۴ روز رایگان، و قفل شدن امکانات بعد از پایان Trial.',
    addLabel: 'ثبت مرحله',
    titleLabel: 'مرحله',
    subtitleLabel: 'جزئیات',
    icon: ShieldCheck,
    seed: [
      seedRecord(
        'teacher-onboarding',
        1,
        'تکمیل اطلاعات هویتی',
        'نام، نام خانوادگی، موبایل، آدرس',
        'teacher',
        'completed'
      ),
      seedRecord(
        'teacher-onboarding',
        2,
        'فعال‌سازی ۱۴ روز رایگان',
        'همه امکانات تا خرید پلن باز هستند',
        'teacher'
      ),
    ],
  },
  subjects: {
    scope: 'subjects',
    title: 'مدیریت درس‌ها و سوییچر موضوع',
    description: 'تعریف درس، اتصال به مدرس/زبان‌آموز، و پایه لازم برای سوییچر درس در داشبوردها.',
    addLabel: 'افزودن درس',
    titleLabel: 'نام درس',
    subtitleLabel: 'مدرس/سطح',
    icon: BookCopy,
    seed: [
      seedRecord('subjects', 1, 'زبان انگلیسی', 'A1 تا C2 - استاد نمونه'),
      seedRecord('subjects', 2, 'ریاضی', 'پایه دهم - زمان‌بندی مستقل'),
    ],
  },
  availability: {
    scope: 'availability',
    title: 'زمان‌های آزاد مدرس و جلوگیری از تداخل',
    description: 'ثبت بازه‌های آزاد، کلاس‌های بیرون از پلتفرم، و وضعیت تداخل زمانی به صورت ماک.',
    addLabel: 'ثبت بازه زمانی',
    titleLabel: 'روز و ساعت',
    subtitleLabel: 'نوع بازه',
    icon: CalendarDays,
    seed: [
      seedRecord('availability', 1, 'شنبه ۱۶:۰۰ تا ۱۸:۰۰', 'آزاد برای کلاس جدید'),
      seedRecord(
        'availability',
        2,
        'دوشنبه ۲۰:۰۰',
        'کلاس خصوصی خارج از پلتفرم',
        'teacher',
        'blocked'
      ),
    ],
  },
  calendar: {
    scope: 'calendar',
    title: 'تقویم کلاس و آزمون',
    description: 'نمای یکپارچه کلاس‌ها و آزمون‌ها با فیلتر نقش، فرزند، درس، و وضعیت آینده/گذشته.',
    addLabel: 'افزودن رویداد',
    titleLabel: 'عنوان رویداد',
    subtitleLabel: 'فیلتر/درس/فرزند',
    icon: CalendarDays,
    seed: [
      seedRecord('calendar', 1, 'کلاس Future Tenses', 'تقویم جلالی/میلادی - آینده'),
      seedRecord(
        'calendar',
        2,
        'آزمون میان‌ترم',
        'درس زبان انگلیسی - ۳۰ دقیقه',
        'student',
        'pending'
      ),
    ],
  },
  'lesson-plans': {
    scope: 'lesson-plans',
    title: 'طرح درس جلسه',
    description: 'فهرست هدف‌ها، فعالیت‌ها و منابع هر جلسه پیش از شروع کلاس.',
    addLabel: 'افزودن طرح درس',
    titleLabel: 'عنوان جلسه',
    subtitleLabel: 'اهداف آموزشی',
    icon: FileText,
    seed: [seedRecord('lesson-plans', 1, 'Present Perfect', 'Warm-up، تمرین، جمع‌بندی')],
    longText: true,
  },
  files: {
    scope: 'files',
    title: 'فایل‌ها، جلسه آنلاین و File Bank',
    description: 'ماک آپلود فایل جلسه، لینک ورود آنلاین، و بانک فایل Pro مدرس.',
    addLabel: 'افزودن فایل/لینک',
    titleLabel: 'نام فایل یا لینک',
    subtitleLabel: 'دسترسی/درس/جلسه',
    icon: Upload,
    seed: [
      seedRecord('files', 1, 'homework-sample.pdf', 'قابل دانلود برای زبان‌آموز و ولی'),
      seedRecord('files', 2, 'https://meet.example/solo', 'لینک جلسه آنلاین ارسال‌شده با SMS'),
    ],
  },
  notifications: {
    scope: 'notifications',
    title: 'اعلان‌ها و یادآورها',
    description: 'مرکز اعلان ماک برای کلاس، آزمون، پرداخت، تصحیح آزمون و پیام‌های جدید.',
    addLabel: 'ساخت اعلان',
    titleLabel: 'عنوان اعلان',
    subtitleLabel: 'گیرنده/کانال',
    icon: Bell,
    seed: [
      seedRecord('notifications', 1, '۳۰ دقیقه تا شروع کلاس', 'SMS + پنل زبان‌آموز/ولی'),
      seedRecord('notifications', 2, 'نتیجه آزمون ثبت شد', 'ارسال به زبان‌آموز و ولی', 'student'),
    ],
  },
  sms: {
    scope: 'sms',
    title: 'قالب‌های SMS و تنظیمات ارسال',
    description: 'تعریف قالب توسط ادمین و فعال/غیرفعال کردن نوع پیامک توسط مدرس.',
    addLabel: 'افزودن قالب',
    titleLabel: 'نام قالب',
    subtitleLabel: 'متن قالب',
    icon: MessageSquareText,
    seed: [
      seedRecord('sms', 1, 'یادآور کلاس', 'کلاس {{student}} تا ۳۰ دقیقه دیگر شروع می‌شود'),
      seedRecord('sms', 2, 'غیبت', '{{student}} در جلسه امروز غایب بود', 'admin'),
    ],
    longText: true,
  },
  payments: {
    scope: 'payments',
    title: 'پرداخت، شهریه و قفل دسترسی',
    description:
      'نمای پرداخت Standard/Pro، لینک پرداخت، تاریخچه، وضعیت معوق و قفل فایل/کلاس/آزمون.',
    addLabel: 'ثبت پرداخت',
    titleLabel: 'شرح پرداخت',
    subtitleLabel: 'دانش‌آموز/ولی',
    icon: CreditCard,
    seed: [
      {
        ...seedRecord('payments', 1, 'شهریه فروردین', 'پرداخت‌شده توسط ولی', 'parent', 'completed'),
        amount: 450000,
      },
      {
        ...seedRecord(
          'payments',
          2,
          'جلسه خصوصی',
          'معوق - دسترسی آزمون قفل است',
          'student',
          'blocked'
        ),
        amount: 250000,
      },
    ],
    amountMode: true,
  },
  certificates: {
    scope: 'certificates',
    title: 'گواهی پایان‌ترم و PDF',
    description: 'صدور خودکار گواهی/مجوز آزمون نهایی بر اساس نمره و نمایش در پنل زبان‌آموز و ولی.',
    addLabel: 'صدور گواهی',
    titleLabel: 'عنوان گواهی',
    subtitleLabel: 'درس/نمره/قالب',
    icon: FileText,
    seed: [
      seedRecord(
        'certificates',
        1,
        'گواهی ترم A2',
        'نمره ۱۸.۵ - قالب پیش‌فرض',
        'student',
        'completed'
      ),
    ],
  },
  'question-bank': {
    scope: 'question-bank',
    title: 'بانک سؤال و Rich Text',
    description: 'تعریف سؤال چندگزینه‌ای/تشریحی با وزن نمره، پاسخ صحیح و متن غنی به صورت ماک.',
    addLabel: 'افزودن سؤال',
    titleLabel: 'متن سؤال',
    subtitleLabel: 'نوع/وزن/پاسخ',
    icon: BookCopy,
    seed: [seedRecord('question-bank', 1, 'Choose the correct tense', 'چهارگزینه‌ای - وزن ۲')],
    longText: true,
  },
  grading: {
    scope: 'grading',
    title: 'تصحیح دستی و نمره‌دهی تشریحی',
    description: 'صف بررسی پاسخ تشریحی، نمره هر سؤال، جمع خودکار، و وضعیت اعلام نتیجه.',
    addLabel: 'افزودن پاسخ برای تصحیح',
    titleLabel: 'نام آزمون/زبان‌آموز',
    subtitleLabel: 'نمره/بازخورد',
    icon: CheckCircle2,
    seed: [
      seedRecord(
        'grading',
        1,
        'Midterm - علی رضایی',
        'سؤال ۲ نیازمند تصحیح دستی',
        'teacher',
        'pending'
      ),
    ],
  },
  semesters: {
    scope: 'semesters',
    title: 'ترم‌ها، سطح‌ها و آزمون اجباری',
    description: 'تعریف ترم، سطح آموزشی، آزمون میان‌ترم/پایان‌ترم و کنترل وجود آزمون اجباری.',
    addLabel: 'افزودن ترم',
    titleLabel: 'نام ترم',
    subtitleLabel: 'سطح/آزمون‌ها',
    icon: CalendarDays,
    seed: [seedRecord('semesters', 1, 'Spring 2026 - A2', 'میان‌ترم و پایان‌ترم تعریف شده')],
  },
  permissions: {
    scope: 'permissions',
    title: 'نقش‌ها و دسترسی‌های ادمین/پشتیبان',
    description: 'ماک permission matrix برای ادمین اصلی، ادمین ثانویه و پشتیبان.',
    addLabel: 'افزودن دسترسی',
    titleLabel: 'نقش/کاربر',
    subtitleLabel: 'دسترسی‌ها',
    icon: ShieldCheck,
    seed: [
      seedRecord(
        'permissions',
        1,
        'Support Level 1',
        'تیکت‌ها، مشاهده کاربران، بدون حذف',
        'support'
      ),
      seedRecord('permissions', 2, 'Secondary Admin', 'درآمد و کاربران، بدون login-as', 'admin'),
    ],
  },
  'profile-approvals': {
    scope: 'profile-approvals',
    title: 'تأیید پروفایل عمومی مدرس',
    description: 'صف درخواست ساخت پروفایل Pro، دلیل رد، و وضعیت انتشار.',
    addLabel: 'افزودن درخواست',
    titleLabel: 'مدرس',
    subtitleLabel: 'وضعیت/دلیل',
    icon: Users,
    seed: [
      seedRecord(
        'profile-approvals',
        1,
        'استاد نمونه',
        'در انتظار تأیید مدارک',
        'admin',
        'pending'
      ),
    ],
  },
  'public-profile': {
    scope: 'public-profile',
    title: 'پروفایل عمومی Pro مدرس',
    description: 'اطلاعات شخصی، تصویر، آدرس، مدارک، گالری، و سیگنال‌های SEO برای جذب دانش‌آموز.',
    addLabel: 'افزودن بخش پروفایل',
    titleLabel: 'بخش',
    subtitleLabel: 'محتوا/SEO',
    icon: Users,
    seed: [
      seedRecord('public-profile', 1, 'درباره مدرس', '۱۰ سال تجربه، IELTS، تهران'),
      seedRecord(
        'public-profile',
        2,
        'گالری و ویدئو معرفی',
        '۳ تصویر، ۱ ویدئو دمو',
        'teacher',
        'pending'
      ),
    ],
    longText: true,
  },
  articles: {
    scope: 'articles',
    title: 'مقاله و فایل آموزشی Pro',
    description: 'ویرایشگر محتوای آموزشی با عنوان SEO، توضیحات متا و وضعیت انتشار.',
    addLabel: 'افزودن مقاله',
    titleLabel: 'عنوان مقاله',
    subtitleLabel: 'Meta description',
    icon: FileText,
    seed: [
      seedRecord(
        'articles',
        1,
        'چطور Speaking را تمرین کنیم؟',
        'راهنمای تمرین روزانه برای زبان‌آموزان'
      ),
    ],
    longText: true,
  },
  'all-chats': {
    scope: 'all-chats',
    title: 'مدیریت همه گفتگوها',
    description: 'نمای ادمین/پشتیبان برای مشاهده اتاق‌های گفتگوی نقش‌ها و وضعیت رسیدگی.',
    addLabel: 'ثبت اتاق گفتگو',
    titleLabel: 'اتاق',
    subtitleLabel: 'شرکت‌کننده‌ها/وضعیت',
    icon: MessageSquareText,
    seed: [
      seedRecord(
        'all-chats',
        1,
        'ولی - مدرس - زبان‌آموز',
        'آخرین پیام نیازمند پیگیری',
        'admin',
        'pending'
      ),
    ],
  },
  bans: {
    scope: 'bans',
    title: 'مسدودسازی کاربران و Login As',
    description: 'کنترل وضعیت حساب، دلیل مسدودی، و شبیه‌سازی ورود ادمین به حساب نقش‌های دیگر.',
    addLabel: 'ثبت وضعیت حساب',
    titleLabel: 'کاربر',
    subtitleLabel: 'دلیل/اقدام',
    icon: LockKeyhole,
    seed: [
      seedRecord('bans', 1, 'teacher@demo.local', 'فعال - امکان Login as برای ادمین', 'admin'),
    ],
  },
};

const statusOptions: MockRecordStatus[] = ['draft', 'active', 'pending', 'completed', 'blocked'];

export function MockFeaturePage({ kind }: { kind: FeatureKind }) {
  const config = configs[kind];
  const { user } = useAuth();
  const [version, setVersion] = useState(0);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<MockRecordStatus>('active');

  const records = useMemo(() => {
    void version;
    return readMockRecords(config.scope, config.seed);
  }, [config.scope, config.seed, version]);

  const Icon = config.icon;

  const refresh = () => setVersion((current) => current + 1);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !subtitle.trim()) {
      toast.error('عنوان و توضیح الزامی است');
      return;
    }
    addMockRecord(config.scope, {
      title: title.trim(),
      subtitle: subtitle.trim(),
      ownerRole: user?.role ?? 'teacher',
      status,
      amount: config.amountMode ? Number(amount) || 0 : undefined,
    });
    setTitle('');
    setSubtitle('');
    setAmount('');
    setStatus('active');
    refresh();
    toast.success('آیتم ماک ذخیره شد');
  };

  const updateStatus = (record: MockRecord, nextStatus: MockRecordStatus) => {
    updateMockRecordStatus(config.scope, record.id, nextStatus);
    refresh();
    toast.success('وضعیت به‌روزرسانی شد');
  };

  const remove = (record: MockRecord) => {
    deleteMockRecord(config.scope, record.id);
    refresh();
    toast.success('آیتم حذف شد');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Icon className="text-primary size-5" />
            <h2 className="text-xl font-semibold">{config.title}</h2>
          </div>
          <p className="text-muted-foreground max-w-3xl text-sm">{config.description}</p>
        </div>
        <Badge variant="secondary">Mock Frontend</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{config.addLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>{config.titleLabel}</Label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label>{config.subtitleLabel}</Label>
              {config.longText ? (
                <Textarea value={subtitle} onChange={(event) => setSubtitle(event.target.value)} />
              ) : (
                <Input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} />
              )}
            </div>
            <div className="space-y-2">
              <Label>وضعیت</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as MockRecordStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {STATUS_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {config.amountMode && (
              <div className="space-y-2">
                <Label>مبلغ</Label>
                <Input
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </div>
            )}
            <div className="flex items-end">
              <Button type="submit">
                <Plus className="size-4" />
                ذخیره
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">لیست عملیاتی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>عنوان</TableHead>
                  <TableHead>توضیح</TableHead>
                  {config.amountMode && <TableHead>مبلغ</TableHead>}
                  <TableHead>مالک</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>تاریخ</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.title}</TableCell>
                    <TableCell className="max-w-md text-sm text-slate-600">
                      {record.subtitle}
                    </TableCell>
                    {config.amountMode && (
                      <TableCell>{formatCurrency(record.amount ?? 0)}</TableCell>
                    )}
                    <TableCell>{record.ownerRole}</TableCell>
                    <TableCell>
                      <Select
                        value={record.status}
                        onValueChange={(value) => updateStatus(record, value as MockRecordStatus)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((item) => (
                            <SelectItem key={item} value={item}>
                              {STATUS_LABELS[item]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{formatPersianDateTime(record.date)}</TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" onClick={() => remove(record)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function OtpAccessPage() {
  return <MockFeaturePage kind="otp" />;
}
export function TeacherOnboardingPage() {
  return <MockFeaturePage kind="onboarding" />;
}
export function SubjectsPage() {
  return <MockFeaturePage kind="subjects" />;
}
export function AvailabilityPage() {
  return <MockFeaturePage kind="availability" />;
}
export function CalendarPage() {
  return <MockFeaturePage kind="calendar" />;
}
export function LessonPlansPage() {
  return <MockFeaturePage kind="lesson-plans" />;
}
export function FilesPage() {
  return <MockFeaturePage kind="files" />;
}
export function NotificationsPage() {
  return <MockFeaturePage kind="notifications" />;
}
export function SmsTemplatesPage() {
  return <MockFeaturePage kind="sms" />;
}
export function PaymentCenterPage() {
  return <MockFeaturePage kind="payments" />;
}
export function CertificatesPage() {
  return <MockFeaturePage kind="certificates" />;
}
export function QuestionBankPage() {
  return <MockFeaturePage kind="question-bank" />;
}
export function ManualGradingPage() {
  return <MockFeaturePage kind="grading" />;
}
export function SemestersPage() {
  return <MockFeaturePage kind="semesters" />;
}
export function AdminPermissionsPage() {
  return <MockFeaturePage kind="permissions" />;
}
export function ProfileApprovalsPage() {
  return <MockFeaturePage kind="profile-approvals" />;
}
export function TeacherPublicProfilePage() {
  return <MockFeaturePage kind="public-profile" />;
}
export function ArticlesPage() {
  return <MockFeaturePage kind="articles" />;
}
export function AllChatsPage() {
  return <MockFeaturePage kind="all-chats" />;
}
export function UserBansPage() {
  return <MockFeaturePage kind="bans" />;
}
