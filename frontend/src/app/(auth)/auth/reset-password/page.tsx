/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import clsx from 'clsx';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  useResetPasswordMutation,
  useSendOtpCodeMutation,
  useVerifyOtpMutation,
} from '../../../../lib/slices/logApiSlice';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export default function Page() {
  const [step1, setStep1] = useState(true);
  const [step2, setStep2] = useState(false);
  const [step3, setStep3] = useState(false);
  const [loader, setLoader] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resendCodeTimer, setResendCodeTimer] = useState(0);
  const [intervalState, setIntervalState] = useState<NodeJS.Timeout | null>(
    null,
  );
  const { toast } = useToast();
  const router = useRouter();
  const [getCode] = useSendOtpCodeMutation();
  const [verifyOtpCode] = useVerifyOtpMutation();
  const [reset] = useResetPasswordMutation();

  const emailFormSchema = z.object({
    email: z.string().email({
      message: 'Must be a valid email.',
    }),
  });

  const passwordFormSchema = z
    .object({
      password: z
        .string()
        .min(6, { message: 'Password must be at least 6 characters' }),
      confirmPassword: z
        .string()
        .min(6, { message: 'Password must be at least 6 characters' }),
    })
    .refine(
      (values) => {
        return values.password === values.confirmPassword;
      },
      { message: 'Passwords must match', path: ['confirmPassword'] },
    );

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: '',
    },
  });

  async function sendOtp(values: z.infer<typeof emailFormSchema>) {
    await getOtp(values.email);
  }

  async function getOtp(email: string) {
    setLoader(true);

    try {
      await getCode({ email }).unwrap();
      setStep1(false);
      setUserEmail(email);
      toast({
        description: 'Otp sent to your email',
        duration: 2000,
      });
      setStep2(true);
      setResendCodeTimer(30);
      if (intervalState) {
        clearInterval(intervalState);
      }
      setIntervalState(
        setInterval(() => {
          setResendCodeTimer((prev) => prev - 1);
        }, 1000),
      );
    } catch (error: any) {
      toast({
        variant: 'destructive',
        description: error.data.message,
        duration: 2000,
      });
    } finally {
      setLoader(false);
    }
  }

  async function verifyOtp() {
    setLoader(true);

    try {
      await verifyOtpCode({ code: otp }).unwrap();
      setStep2(false);
      toast({
        description: 'OTP verified',
        duration: 2000,
      });
      setStep3(true);
      console.log('here 1');
      if (intervalState) clearInterval(intervalState);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        description: error.data.message,
        duration: 2000,
      });
    } finally {
      setLoader(false);
    }
  }

  async function resetPassword(values: z.infer<typeof passwordFormSchema>) {
    setLoader(true);

    try {
      await reset({ email: userEmail, password: values.password }).unwrap();
      toast({
        description: 'Password changed successfully',
        duration: 2000,
      });
      router.push('/auth/signin');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        description: error.data.message,
        duration: 2000,
      });
    } finally {
      setLoader(false);
    }
  }

  return (
    <div className=' p-5 my-auto  flex justify-center items-center'>
      <Card className='w-[470px] h-[350px] pt-8 relative block'>
        <div
          className={clsx(
            ' absolute  transition-all duration-500 ease-in-out transform',
            step1
              ? 'translate-x-0 opacity-100 z-10'
              : '-translate-x-full opacity-0 z-0',
          )}
        >
          <CardHeader>
            <CardTitle className='text-lg'>Password reset</CardTitle>
            <CardDescription>
              Please enter your email address associated with your account to
              reset your password.
            </CardDescription>
          </CardHeader>
          <Form {...emailForm}>
            <CardContent>
              <form
                onSubmit={emailForm.handleSubmit(sendOtp)}
                className='grid w-full items-center gap-4'
              >
                <FormField
                  control={emailForm.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem className='flex flex-col space-y-1.5'>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          id='email'
                          type='email'
                          placeholder='Email'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button disabled={loader} type='submit' className='w-full'>
                  Send OTP code
                </Button>
              </form>
            </CardContent>
          </Form>
        </div>

        <div
          className={clsx(
            'flex flex-col gap-4 items-center absolute   w-full h-full transition-all duration-500 ease-in-out transform',
            step2
              ? 'translate-x-0 opacity-100 z-10 '
              : '-translate-x-full opacity-0 z-0 ',
          )}
        >
          <CardHeader>
            <CardDescription className='text-base'>
              Enter the code that was sent to {userEmail}. If you can not find
              the message in your inbox, please check spam folder.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid w-full items-center gap-4'>
              <div className='flex flex-col space-y-1.5 items-center'>
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                  onChange={(value) => setOtp(value)}
                  value={otp}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          </CardContent>
          <CardFooter className='flex flex-col  gap-2 w-full'>
            <Button onClick={verifyOtp} disabled={loader} className='w-full'>
              {loader ? 'Please wait...' : 'Verify OTP'}
            </Button>
            <div className='flex items-center gap-2'>
              <span>Didn&apos;t receive code?</span>
              <Button
                onClick={() => getOtp(userEmail)}
                variant='outline'
                className=' border-none text-primary bg-transparent hover:bg-transparent text-blue-500 hover:text-blue-700'
                disabled={resendCodeTimer > 0}
              >
                {resendCodeTimer > 0
                  ? `Resend code in ${resendCodeTimer}`
                  : 'Resend code'}
                {/* {resendCodeTimer > 0 && `(${resendCodeTimer})`} */}
              </Button>
            </div>
          </CardFooter>
        </div>
        <div
          className={clsx(
            'flex flex-col gap-4 items-center absolute w-full h-full top-1 transition-all duration-500 ease-in-out transform',
            step3
              ? 'translate-x-0 opacity-100 z-10'
              : '-translate-x-full opacity-0 z-0',
          )}
        >
          <CardHeader>
            <CardDescription className='text-lg'>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <Form {...passwordForm}>
            <CardContent className='w-full'>
              <form
                onSubmit={passwordForm.handleSubmit(resetPassword)}
                className='flex flex-col w-full items-center gap-4'
              >
                <FormField
                  control={passwordForm.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem className='flex flex-col gap-2 w-full '>
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
                <FormField
                  control={passwordForm.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem className='flex flex-col gap-2 w-full '>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <Input
                          id='confirmPassword'
                          type='password'
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button disabled={loader} type='submit' className='w-full mt-2'>
                  {loader ? 'Please wait...' : 'Confirm'}
                </Button>
              </form>
            </CardContent>
          </Form>
        </div>
      </Card>
    </div>
  );
}
