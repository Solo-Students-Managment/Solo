import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRevenue } from '@/contexts/RevenueContext'
import { useStudents } from '@/contexts/StudentContext'
import { REVENUE_STATUSES, REVENUE_TYPES } from '@/lib/revenue'
import { StatCard } from '@/components/shared/StatCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatPersianDate } from '@/lib/formatters'
import { getUserById } from '@/lib/studentStore'

const statusVariant = {
  paid: 'success',
  pending: 'warning',
  overdue: 'danger',
} as const

export function AdminRevenuePage() {
  const { records, summary, createRecord, deleteRecord } = useRevenue()
  const { students, getUsersByRole } = useStudents()
  const parents = getUsersByRole('parent')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    studentId: students[0]?.userId ?? '',
    parentId: parents[0]?.id ?? '',
    amount: '',
    type: 'tuition' as const,
    status: 'pending' as const,
    date: new Date().toISOString().slice(0, 10),
    description: '',
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    try {
      createRecord({
        ...form,
        amount: Number(form.amount),
      })
      toast.success('رکورد درآمد ثبت شد')
      setShowForm(false)
    } catch {
      toast.error('خطا در ثبت درآمد')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">درآمد</h2>
          <p className="text-sm text-muted-foreground">مدیریت پرداخت‌ها و شهریه‌ها</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="size-4" />
          ثبت درآمد
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="پرداخت شده" value={formatCurrency(summary.totalPaid)} />
        <StatCard title="در انتظار" value={formatCurrency(summary.totalPending)} />
        <StatCard title="معوق" value={formatCurrency(summary.totalOverdue)} />
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">ثبت درآمد جدید</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>زبان‌آموز</Label>
                <Select
                  value={form.studentId}
                  onValueChange={(studentId) => {
                    const student = students.find((s) => s.userId === studentId)
                    setForm({ ...form, studentId, parentId: student?.parentId ?? form.parentId })
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.userId} value={student.userId}>
                        {getUserById(student.userId)?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>مبلغ (تومان)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>نوع</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as typeof form.type })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REVENUE_TYPES.map((item) => (
                      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>وضعیت</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REVENUE_STATUSES.map((item) => (
                      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>تاریخ</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>توضیحات</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit">ذخیره</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>انصراف</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">لیست تراکنش‌ها</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>تاریخ</TableHead>
                  <TableHead>زبان‌آموز</TableHead>
                  <TableHead>توضیحات</TableHead>
                  <TableHead>مبلغ</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatPersianDate(record.date)}</TableCell>
                    <TableCell>{getUserById(record.studentId)?.name ?? '—'}</TableCell>
                    <TableCell>{record.description}</TableCell>
                    <TableCell>{formatCurrency(record.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[record.status]}>
                        {REVENUE_STATUSES.find((s) => s.value === record.status)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" onClick={() => deleteRecord(record.id)}>
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
  )
}
