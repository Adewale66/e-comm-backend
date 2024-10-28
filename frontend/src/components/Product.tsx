/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from 'next/image';
import React from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import { StarIcon } from './icons';
import { cn } from '../lib/utils';
import { RootState } from '../lib/store';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../hooks/use-toast';
import { useAddToCartMutation } from '../lib/slices/cartApiSlice';
import { addToCart } from '../lib/slices/guestCart';
import { useRouter } from 'next/navigation';

const Product = ({
  name,
  price,
  description,
  imageSrc,
  rating,
  id,
}: {
  name: string;
  price: number;
  description: string;
  imageSrc: string;
  rating: number;
  id: string;
}) => {
  const user = useSelector((state: RootState) => state.auth.userInfo);
  const dispatch = useDispatch();
  const [addItem, { isLoading }] = useAddToCartMutation();
  const { toast } = useToast();
  const router = useRouter();

  async function addItemToCart() {
    if (user) {
      try {
        await addItem({
          productId: id,
          quantity: 1,
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
      dispatch(
        addToCart({
          productId: id,
          name: name,
          price: price,
          image: imageSrc,
          quantity: 1,
          subtotal: price,
        }),
      );
    }
    toast({
      description: 'Added to cart',
      duration: 2500,
    });
  }

  return (
    <div className='max-w-[350px] flex-grow '>
      <div className='group hover:cursor-pointer transition-transform ease-in-out transform hover:scale-105 flex flex-col gap-4 hover:border-2 hover:border-primary  p-4 rounded-lg'>
        <Image
          src={imageSrc}
          width={150}
          height={150}
          alt='Product Image'
          className='w-full h-[250px] object-cover rounded-lg'
          style={{ aspectRatio: '1/1', objectFit: 'fill' }}
        />
        <Link
          href={`/products/${name.split(' ').join('-').toLowerCase()}`}
          className='flex flex-col gap-2'
        >
          <h3 className='text-lg font-medium'>{name} </h3>
          <p className='text-muted-foreground text-sm'>{description}</p>
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1'>
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    rating > i ? 'fill-primary' : 'text-muted-foreground',
                  )}
                />
              ))}
            </div>
            <span className='text-muted-foreground text-sm'>
              ({Math.floor(Math.random() * 100)})
            </span>
          </div>
        </Link>
        <div className='flex items-center justify-between'>
          <span className='text-lg font-bold'>${price}</span>
          <Button size='sm' onClick={addItemToCart} disabled={isLoading}>
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Product;
