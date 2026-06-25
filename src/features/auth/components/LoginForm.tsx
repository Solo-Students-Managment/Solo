/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { DemoAccounts } from './DemoAccounts';
import { hasPersian, toEnglishNumbers } from '@/lib/helper/helper';

type Props = {
  onSubmit: (username: string, password: string) => boolean;
};

const loginSchema = Yup.object().shape({
  username: Yup.string().required('required'),
  password: Yup.string().required('required'),
});

export function LoginForm({ onSubmit }: Props) {
  const handleSubmit = (values: any, { setSubmitting }: any) => {
    const username = values.username.trim().toLowerCase();
    const password = values.password;

    const ok = onSubmit(username, password);

    if (!ok) {
      toast.error('نام کاربری یا رمز عبور اشتباه است');
    }

    setSubmitting(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={loginSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            <Card className="rounded-3xl border-white/40 bg-white/80 shadow-2xl backdrop-blur-md">
              <CardHeader className="space-y-2 pt-8 text-center">
                <div className="text-4xl">🎓</div>
                <h1 className="text-xl font-bold">پنل آموزش زبان‌آموز</h1>
                <p className="text-sm text-gray-500">وارد شوید تا ادامه دهید</p>
              </CardHeader>

              <CardContent className="space-y-4 pb-8">
                {/* USERNAME */}
                <Input
                  value={values.username}
                  onChange={(e) => {
                    let val = e.target.value;

                    val = toEnglishNumbers(val);

                    if (hasPersian(val)) return;

                    setFieldValue('username', val);
                  }}
                  placeholder="نام کاربری"
                  className="h-12 rounded-md"
                />

                {/* PASSWORD */}
                <Input
                  type="password"
                  value={values.password}
                  onChange={(e) => {
                    let val = e.target.value;

                    val = toEnglishNumbers(val);

                    setFieldValue('password', val);
                  }}
                  placeholder="رمز عبور"
                  className="h-12 rounded-md"
                />

                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-md bg-linear-to-r from-sky-400 to-blue-500"
                  >
                    ورود
                  </Button>
                </motion.div>

                <DemoAccounts
                  onFill={(username, password) => {
                    setFieldValue('username', username);
                    setFieldValue('password', password);
                  }}
                />
              </CardContent>
            </Card>
          </Form>
        )}
      </Formik>
    </motion.div>
  );
}
