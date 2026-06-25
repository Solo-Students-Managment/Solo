import * as Yup from 'yup';

export const loginSchema = Yup.object({
  username: Yup.string()
    .required('Username is required')
    .test('no-persian', 'Please use English characters only', (value) => {
      if (!value) return true;
      return !/[؀-ۿ]/.test(value);
    }),

  password: Yup.string().required('Password is required').min(4, 'Too short'),
});
