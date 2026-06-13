import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ChevronDown, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { DEMO_PASSWORD, mockUsers } from '@/mocks/users'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ROLE_LABELS } from '@/lib/routes'

const demoAccounts = mockUsers.filter((user) =>
  ['student@demo.local', 'parent@demo.local', 'teacher@demo.local', 'admin@demo.local'].includes(
    user.username,
  ),
)

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const success = login(username.trim(), password)
    if (success) {
      navigate('/dashboard')
      return
    }
    toast.error('نام کاربری یا رمز عبور اشتباه است')
  }

  const fillDemo = (demoUsername: string) => {
    setUsername(demoUsername)
    setPassword(DEMO_PASSWORD)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <GraduationCap className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl">پنل مدیریت زبان‌آموز و اولیا</CardTitle>
          <CardDescription>برای ورود اطلاعات حساب خود را وارد کنید</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">نام کاربری</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="student@demo.local"
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="•••••••"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              ورود
            </Button>
          </form>

          <Collapsible className="mt-6">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                حساب‌های آزمایشی
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => fillDemo(account.username)}
                  className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <span>{ROLE_LABELS[account.role]}</span>
                  <span className="text-muted-foreground">{account.username}</span>
                </button>
              ))}
              <p className="text-center text-xs text-muted-foreground">رمز همه حساب‌ها: demo123</p>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  )
}
