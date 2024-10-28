'use client';
import Link from 'next/link';
import React from 'react';
import { CircleCheckIcon, TriangleAlertIcon } from '../../../components/icons';
import { useSearchParams } from 'next/navigation';
import { useVerifyPaymentQuery } from '../../../lib/slices/paymentApi';
import Loader from '../../../components/Loader';

const Page = () => {
  const searchParams = useSearchParams();

  const session_id = searchParams.get('session_id');

  const { data, isLoading } = useVerifyPaymentQuery(
    {
      session_id: session_id as string,
    },
    {
      skip: !session_id,
    },
  );

  if (!session_id) {
    return (
      <div className='flex flex-col items-center justify-center bg-background px-4 my-auto sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-md text-center'>
          <TriangleAlertIcon className='mx-auto h-12 w-12 text-red-500' />
          <h1 className='mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
            Invalid Payment Session
          </h1>
          <p className='mt-4 text-muted-foreground'>
            Your payment session is invalid. Please try again.
          </p>
          <div className='mt-6'>
            <Link
              href='/'
              className='inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
              prefetch={false}
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full w-full my-auto'>
        <Loader />
      </div>
    );
  }

  if (data?.data.status !== 'Success') {
    <div className='flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-md text-center'>
        <TriangleAlertIcon className='mx-auto h-12 w-12 text-red-500' />
        <h1 className='mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
          Payment Failed
        </h1>
        <p className='mt-4 text-muted-foreground'>
          There was an error processing your payment. Please try again or
          contact support for assistance.
        </p>
        <div className='mt-6'>
          <Link
            href='/'
            className='inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
            prefetch={false}
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>;
  }

  return (
    <div className='flex flex-col items-center justify-center bg-background px-4 my-auto sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-md text-center'>
        <CircleCheckIcon className='mx-auto h-12 w-12 text-green-500' />
        <h1 className='mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
          Payment Successful!
        </h1>
        <p className='mt-4 text-muted-foreground'>
          Your payment was processed successfully. Thank you for your business.
        </p>
        <div className='mt-6'>
          <Link
            href='/'
            className='inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
            prefetch={false}
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Page;
