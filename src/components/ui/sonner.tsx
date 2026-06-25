import { Toaster as Sonner } from 'sonner';

function Toaster() {
  return (
    <Sonner
      position="top-center"
      dir="rtl"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        duration: 3000,

        classNames: {
          toast: 'font-sans rounded-2xl shadow-xl border backdrop-blur-md px-4 py-3 text-sm',

          title: 'font-bold text-sm',
          description: 'text-xs opacity-80',
          actionButton: 'rounded-xl px-3 py-1 text-xs font-medium',

          success: 'bg-gradient-to-r from-sky-100 to-green-100 text-slate-700 border-sky-200',

          error: 'bg-gradient-to-r from-pink-100 to-red-100 text-slate-700 border-pink-200',

          info: 'bg-gradient-to-r from-sky-100 to-blue-100 text-slate-700 border-sky-200',

          warning:
            'bg-gradient-to-r from-yellow-100 to-orange-100 text-slate-700 border-yellow-200',
        },
      }}
    />
  );
}

export { Toaster };
