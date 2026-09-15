import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { DEMO_PASSWORD } from '@/mocks/users';
import { demoAccounts } from '../constants/demoAccounts';

type Props = {
  onFill: (username: string, password: string) => void;
};

export function DemoAccounts({ onFill }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="rounded-2xs w-full justify-between">
          حساب‌های آزمایشی
          <ChevronDown size={18} />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3 space-y-2">
        {demoAccounts.map((acc) => (
          <motion.button
            key={acc.username}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFill(acc.username, DEMO_PASSWORD)}
            className="rounded-2xs flex w-full justify-between border bg-white/60 px-3 py-3 text-sm hover:bg-white"
          >
            <span>{acc.role}</span>
            <span className="text-xs text-gray-400">{acc.username}</span>
          </motion.button>
        ))}

        <p className="text-center text-xs text-gray-400">رمز همه حساب‌ها: demo123</p>
      </CollapsibleContent>
    </Collapsible>
  );
}
