'use client';

import { ShoppingCartIcon } from '../../../components/icons';
import { Button } from '../../../components/ui/button';
import {
  useClearCartMutation,
  useGetCartQuery,
} from '../../../lib/slices/cartApiSlice';
import { RootState } from '../../../lib/store';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Cart, clearCart } from '../../../lib/slices/guestCart';
import CartProduct from '../../../components/CartProduct';
import { useToast } from '../../../hooks/use-toast';
import { useCheckoutMutation } from '../../../lib/slices/paymentApi';
import { useRouter } from 'next/navigation';
import Loader from '../../../components/Loader';

const Page = () => {
  const { data, isLoading: cartLoading } = useGetCartQuery();
  const user = useSelector((state: RootState) => state.auth.userInfo);
  const guestCart = useSelector((state: RootState) => state.guestCart);
  const [cart, setCart] = useState<Cart>();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [clearCartUser, { isLoading }] = useClearCartMutation();
  const [checkout, { isLoading: checkoutLoading }] = useCheckoutMutation();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setCart(data || { total: 0, products: [] });
    } else {
      setCart(guestCart);
    }
  }, [data, user, guestCart]);

  async function clearCartHandler() {
    if (user) {
      try {
        await clearCartUser().unwrap();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast({
          description: error.data.message,
          duration: 2500,
          variant: 'destructive',
        });
      }
    } else {
      dispatch(clearCart());
    }
  }

  async function checkoutHandler() {
    if (!user) {
      router.push('/auth/signin');
    } else {
      try {
        const res = await checkout().unwrap();
        window.location.href = res.data.payment_url;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast({
          description: error.data.message,
          duration: 2500,
          variant: 'destructive',
        });
      }
    }
  }

  if (cartLoading) {
    return (
      <div className='flex items-center justify-center h-full w-full my-auto'>
        <Loader />
      </div>
    );
  }

  return (
    <main className='flex-1'>
      <section className='py-12 md:py-16 lg:py-20 flex flex-col items-center'>
        <div className='container px-4 md:px-6'>
          <div className='grid gap-8'>
            <div className='flex items-center justify-between'>
              <h1 className='text-3xl font-bold'>Cart</h1>
              <span className='text-muted-foreground'>
                {cart &&
                  cart?.products.reduce(
                    (acc, item) => acc + item.quantity,
                    0,
                  )}{' '}
                items
              </span>
            </div>
            {cart && cart?.products.length > 0 ? (
              <div className='grid gap-6 items-center'>
                {cart?.products.map((item, index) => (
                  <CartProduct key={index} {...item} />
                ))}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center gap-4'>
                <ShoppingCartIcon className='w-12 h-12 text-muted-foreground' />
                <p className='text-muted-foreground'>Your cart is empty.</p>
              </div>
            )}
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-bold'>Total</h2>
                <p className='text-muted-foreground'>{cart?.total}</p>
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='lg'
                  onClick={clearCartHandler}
                  disabled={isLoading || checkoutLoading}
                >
                  Clear
                </Button>
                <Button
                  size='lg'
                  disabled={checkoutLoading || isLoading}
                  onClick={checkoutHandler}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Page;
