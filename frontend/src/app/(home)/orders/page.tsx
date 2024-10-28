'use client';

import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RootState } from '../../../lib/store';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useGetOrdersQuery } from '../../../lib/slices/paymentApi';
import Loader from '../../../components/Loader';

export const dynamic = 'force-dynamic';

const Page = () => {
  const user = useSelector((state: RootState) => state.auth.userInfo);
  const router = useRouter();
  const { data: orders, isLoading } = useGetOrdersQuery();

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full w-full my-auto'>
        <Loader />
      </div>
    );
  }

  return (
    <main className='flex flex-col'>
      <section className='py-12 md:py-16 lg:py-20 flex justify-center'>
        <div className='container px-4 md:px-6'>
          <h2 className='text-2xl font-bold mb-6'>Order History</h2>
          <div className='flex flex-col gap-6 '>
            {orders &&
              orders.map((order) => (
                <div key={order.order_number} className='min-w-full'>
                  <Card className='min-w-[500px]'>
                    <CardHeader className='flex items-center justify-center'>
                      <div>
                        <h3 className='font-medium'>
                          Order #{order.order_number}
                        </h3>
                        <p className='text-muted-foreground text-sm text-center'>
                          {new Date(order.created_at).toDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          order.order_status === 'IN TRANSIT'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {capitalizeFirstLetter(
                          order.order_status.toLowerCase(),
                        )}
                      </Badge>
                    </CardHeader>
                    <CardContent className='max-w-full'>
                      <div className='grid gap-4'>
                        {order.products.map((item, index) => (
                          <div
                            key={index}
                            className='flex items-center justify-between'
                          >
                            <div className='flex items-center gap-2'>
                              <Image
                                src={item.image}
                                width={50}
                                height={50}
                                alt={item.name}
                                className='rounded-md'
                                style={{
                                  aspectRatio: '50/50',
                                  objectFit: 'cover',
                                }}
                              />
                              <div>
                                <p className='font-medium'>{item.name}</p>
                                <p className='text-muted-foreground text-sm'>
                                  {item.quantity} x ${item.price}
                                </p>
                              </div>
                            </div>
                            <p className='font-medium'>
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className='flex items-center justify-between'>
                      <p className='text-muted-foreground'>
                        Total: ${order.total.toFixed(2)}
                      </p>
                    </CardFooter>
                  </Card>
                </div>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Page;
