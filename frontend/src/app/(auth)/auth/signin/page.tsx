'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '../../../../lib/slices/logApiSlice';
import { setCredentials } from '../../../../lib/slices/authSlice';
import { useToast } from '../../../../hooks/use-toast';
import { RootState } from '../../../../lib/store';
import { useAddBulkMutation } from '../../../../lib/slices/cartApiSlice';
import { clearCart } from '../../../../lib/slices/guestCart';

export default function Page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const { toast } = useToast();
  const guestCart = useSelector((state: RootState) => state.guestCart);
  const [addBulk] = useAddBulkMutation();

  const formSchema = z.object({
    email: z.string().email({ message: 'Must be a valid email' }),
    password: z.string().min(6, {
      message: 'Password must be at least 6 characters',
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await login(values).unwrap();
      dispatch(
        setCredentials({
          name: res.data.name,
          email: res.data.email,
          access_token: res.data.access_token,
        }),
      );
      toast({
        variant: 'default',
        description: 'Successfully logged in',
        duration: 3500,
      });

      try {
        await addBulk({ products: guestCart.products });
      } catch (error) {
      } finally {
        dispatch(clearCart());
      }

      router.push('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'User does not exist',
        duration: 3500,
      });
    }
  }

  return (
    <div className='mx-auto my-auto'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>Login</CardTitle>
          <CardDescription>
            Enter your details below to Login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid gap-2'>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        id='email'
                        type='email'
                        placeholder='m@example.com'
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid gap-2'>
                    <div className='flex items-center'>
                      <FormLabel>Password</FormLabel>
                      <Link
                        href='/auth/reset-password'
                        className='ml-auto inline-block text-sm underline'
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        id='password'
                        type='password'
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' className='w-full' disabled={isLoading}>
                Sign in
              </Button>
            </form>
            <div className='mt-4 text-center text-sm'>
              Don&apos;t have an account?{' '}
              <Link href='/auth/signup' className='underline'>
                Sign up
              </Link>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
