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
import { useToast } from '../../../../hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useRegisterMutation } from '../../../../lib/slices/logApiSlice';

export default function Page() {
  const router = useRouter();
  const { toast } = useToast();
  const [register, { isLoading }] = useRegisterMutation();

  const formSchema = z.object({
    email: z.string().email({ message: 'Must be a valid email' }),
    password: z.string().min(3, {
      message: 'Password must be at least 3 characters',
    }),
    firstName: z.string().min(1, { message: 'First Name must not be empty' }),
    lastName: z.string().min(1, { message: 'Last name must not be empty' }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await register(values).unwrap();
      toast({
        description: 'Account created successfully',
        duration: 2000,
      });
      form.reset();
      router.push('/auth/signin');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        variant: 'destructive',
        description: error.data.message,
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
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='firstName'
                  render={({ field }) => (
                    <FormItem className='grid gap-2'>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Max' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='lastName'
                  render={({ field }) => (
                    <FormItem className='grid gap-2'>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Robinson' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                    <FormLabel>Password</FormLabel>

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
                Create an account
              </Button>
            </form>
            <div className='mt-4 text-center text-sm'>
              Already have an account?{' '}
              <Link href='/auth/signin' className='underline'>
                Sign in
              </Link>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
