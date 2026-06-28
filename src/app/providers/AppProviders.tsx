import type { ReactNode } from 'react';

import { AuthProvider } from '@/app/providers/AuthContext';
import { ChatProvider } from '@/app/providers/ChatContext';
import { ExamProvider } from '@/app/providers/ExamContext';
import { HomeworkProvider } from '@/app/providers/HomeworkContext';
import { RevenueProvider } from '@/app/providers/RevenueContext';
import { SessionApprovalProvider } from '@/app/providers/SessionApprovalContext';
import { SessionScoreProvider } from '@/app/providers/SessionScoreContext';
import { StudentProvider } from '@/app/providers/StudentContext';
import { TicketProvider } from '@/app/providers/TicketContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <StudentProvider>
        <HomeworkProvider>
          <SessionScoreProvider>
            <SessionApprovalProvider>
              <ChatProvider>
                <TicketProvider>
                  <RevenueProvider>
                    <ExamProvider>{children}</ExamProvider>
                  </RevenueProvider>
                </TicketProvider>
              </ChatProvider>
            </SessionApprovalProvider>
          </SessionScoreProvider>
        </HomeworkProvider>
      </StudentProvider>
    </AuthProvider>
  );
}
