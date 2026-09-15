import { Award, CreditCard, ShieldCheck } from 'lucide-react';

import { useAuth } from '@/app/providers/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';

const plans = [
  {
    name: 'Basic',
    price: 0,
    features: ['تا ۵ زبان‌آموز', 'تقویم جلسات', 'تکالیف پایه', 'پشتیبانی الکترونیکی'],
  },
  {
    name: 'Pro',
    price: 250000,
    features: ['پروفایل حرفه‌ای', 'گزارش‌های پیشرفته', 'اختصاص آزمون', 'قالب پیامک و ایمیل'],
  },
];

export function SubscriptionPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">مدیریت اشتراک</h2>
        <p className="text-muted-foreground text-sm">
          {isAdmin
            ? 'بررسی و مدیریت طرح‌های اشتراک برای معلمان'
            : 'جزئیات طرح اشتراک و وضعیت فعلی شما'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.name === 'Pro' ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>{plan.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {plan.price === 0 ? 'رایگان' : formatCurrency(plan.price)} / ماه
                  </p>
                </div>
                <Badge variant={plan.name === 'Pro' ? 'success' : 'outline'}>
                  {plan.name === 'Pro' ? 'پیشنهاد ویژه' : 'شروع'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Button variant={plan.name === 'Pro' ? 'default' : 'outline'}>
                  انتخاب {plan.name}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">سرویس حرفه‌ای Solo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border p-4">
            <div className="text-primary mb-2 flex items-center gap-2">
              <Award className="h-4 w-4" />
              <p className="font-medium">پروفایل معلم حرفه‌ای</p>
            </div>
            <p className="text-sm text-slate-600">
              نمایش بهتر در جستجوی معلمان و جذب دانش‌آموزان بیشتر.
            </p>
          </div>
          <div className="rounded-2xl border p-4">
            <div className="text-primary mb-2 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <p className="font-medium">پرداخت منظم</p>
            </div>
            <p className="text-sm text-slate-600">
              یکپارچه‌سازی برنامه‌های اشتراک ماهانه با مدیریت ساده.
            </p>
          </div>
          <div className="rounded-2xl border p-4">
            <div className="text-primary mb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <p className="font-medium">پشتیبانی پیشرفته</p>
            </div>
            <p className="text-sm text-slate-600">
              دسترسی به گزارش‌های تحلیلی و ابزارهای مدیریتی بیشتر.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
