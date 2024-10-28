/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Image from 'next/image';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { MinusIcon, PlusIcon, XIcon } from './icons';
import { RootState } from '../lib/store';
import { useDispatch, useSelector } from 'react-redux';
import {
  useRemoveFromCartMutation,
  useUpdateQuantityMutation,
} from '../lib/slices/cartApiSlice';
import { updateQuantity, removeFromCart } from '../lib/slices/guestCart';
import { useToast } from '../hooks/use-toast';
import { useRouter } from 'next/navigation';

const CartProduct = ({
  image,
  name,
  price,
  quantity,
  productId,
}: {
  image: string;
  name: string;
  price: number;
  quantity: number;
  productId: string;
}) => {
  const user = useSelector((state: RootState) => state.auth.userInfo);
  const dispatch = useDispatch();
  const [updateItem, { isLoading: isUpdating }] = useUpdateQuantityMutation();
  const [removeItem, { isLoading: isRemoving }] = useRemoveFromCartMutation();
  const { toast } = useToast();
  const router = useRouter();

  async function updateQuantityHandler(type: string) {
    let newQuantity = quantity;
    if (type === 'increment') {
      newQuantity += 1;
    } else {
      newQuantity -= 1;
    }

    if (user) {
      try {
        await updateItem({
          productId,
          quantity: newQuantity,
        }).unwrap();
      } catch (error: any) {
        if (error.data.message === 'Invalid JWT') {
          router.push('/auth/signin');
        } else
          toast({
            description: error.data.message,
            duration: 2500,
            variant: 'destructive',
          });
      }
    } else {
      if (newQuantity == 0) {
        dispatch(removeFromCart(productId));
      } else
        dispatch(
          updateQuantity({
            productId,
            quantity: newQuantity,
          }),
        );
    }
  }

  async function removeItemHandler() {
    if (user) {
      try {
        await removeItem({
          productId,
        }).unwrap();
      } catch (error: any) {
        if (error.data.message === 'Invalid JWT') {
          router.push('/auth/signin');
        } else
          toast({
            description: error.data.message,
            duration: 2500,
            variant: 'destructive',
          });
      }
    } else {
      dispatch(removeFromCart(productId));
    }
  }

  return (
    <Card>
      <CardContent className='flex items-center justify-between'>
        <div className='flex mt-4 items-center gap-4'>
          <Image
            src={image}
            width={100}
            height={100}
            alt={name}
            className='rounded-md'
            style={{
              aspectRatio: '100/100',
              objectFit: 'contain',
            }}
          />
          <div>
            <h3 className='font-medium'>
              {name} x{quantity}
            </h3>
            <p className='text-muted-foreground text-sm'>${price * quantity}</p>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <Button
            size='icon'
            variant='ghost'
            disabled={isUpdating || isRemoving}
            onClick={() => updateQuantityHandler('decrement')}
          >
            <MinusIcon className='w-4 h-4' />
          </Button>
          <span>{quantity}</span>
          <Button
            size='icon'
            variant='ghost'
            disabled={isUpdating || isRemoving}
            onClick={() => updateQuantityHandler('increment')}
          >
            <PlusIcon className='w-4 h-4' />
          </Button>
          <Button
            size='icon'
            variant='ghost'
            disabled={isUpdating || isRemoving}
            onClick={removeItemHandler}
          >
            <XIcon className='w-4 h-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartProduct;
