import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 text-center">
      <div className="shadow-soft max-w-lg rounded-3xl bg-white/90 p-10 backdrop-blur-xl">
        <h1 className="mb-4 text-5xl font-bold text-slate-900">404</h1>
        <p className="mb-6 text-lg text-slate-600">صفحه‌ای که دنبال آن بودید پیدا نشد.</p>
        <div className="flex justify-center gap-4">
          <Link
            to="/dashboard"
            className="bg-primary hover:bg-primary/90 inline-flex rounded-lg px-5 py-3 text-sm font-semibold text-white transition"
          >
            بازگشت به داشبورد
          </Link>
          <Link
            to="/login"
            className="inline-flex rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            صفحه ورود
          </Link>
        </div>
      </div>
    </div>
  );
}
