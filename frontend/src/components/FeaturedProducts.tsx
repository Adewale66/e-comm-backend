/* eslint-disable @typescript-eslint/no-explicit-any */
'use clientt';

import Image from 'next/image';
import { Button } from './ui/button';
import { RootState } from '../lib/store';
import { useDispatch, useSelector } from 'react-redux';
import { useAddToCartMutation } from '../lib/slices/cartApiSlice';
import { addToCart } from '../lib/slices/guestCart';
import { useToast } from '../hooks/use-toast';
import { useRouter } from 'next/navigation';

const FeaturedProducts = ({
  name,
  description,
  price,
  src,
  id,
}: {
  name: string;
  description: string;
  price: number;
  src: string;
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
            description: 'Error adding to cart',
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
          image: src,
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
    <div className='flex flex-col gap-4'>
      <Image
        src={src}
        width={400}
        height={400}
        alt='Product Image'
        className='w-full h-[250px] object-cover rounded-lg'
        style={{ aspectRatio: '400/400', objectFit: 'fill' }}
      />
      <div className='flex flex-col gap-2'>
        <h3 className='text-lg font-medium'>{name}</h3>
        <p className='text-muted-foreground text-sm'>{description}</p>
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

export default FeaturedProducts;
