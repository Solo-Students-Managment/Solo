import { BrowserRouter } from 'react-router-dom';

import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/router/AppRouter';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
      <Toaster />
    </AppProviders>
  );
}
