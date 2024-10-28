'use client';

import Image from 'next/image';
import { useState } from 'react';
import { MinusIcon, PlusIcon, StarIcon } from '../../../../components/icons';
import { Button } from '../../../../components/ui/button';
import { useGetProductQuery } from '../../../../lib/slices/productsSlice';
import Loader from '../../../../components/Loader';
import { RootState } from '../../../../lib/store';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../../../hooks/use-toast';
import { useAddToCartMutation } from '../../../../lib/slices/cartApiSlice';
import { addToCart } from '../../../../lib/slices/guestCart';

export default function Page({ params }: { params: { slug: string } }) {
  const product = params.slug
    .replace(/-/g, ' ')
    .split(' ')
    .map((word) => capitalizeFirstLetter(word))
    .join(' ');
  const tag = params.slug;
  const { data, isLoading } = useGetProductQuery({ tag });
  const user = useSelector((state: RootState) => state.auth.userInfo);
  const dispatch = useDispatch();
  const [addItem, { isLoading: addedLoading }] = useAddToCartMutation();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  async function addItemToCart() {
    if (data)
      if (user) {
        await addItem({
          productId: data?.id,
          quantity: quantity,
        }).unwrap();
      } else {
        dispatch(
          addToCart({
            productId: data?.id,
            name: data?.title,
            price: data.price,
            image: data?.image,
            quantity: quantity,
            subtotal: data.price * quantity,
          }),
        );
      }
    toast({
      description: 'Added to cart',
      duration: 2500,
    });
  }

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full w-full my-auto'>
        <Loader />
      </div>
    );
  }

  return (
    <main>
      <section className='py-12 md:py-16 lg:py-20 flex justify-center'>
        <div className='container px-4 md:px-6'>
          <div className='grid md:grid-cols-2 gap-8'>
            <div>
              <Image
                src={data?.image || '/placeholder.png'}
                width={600}
                height={600}
                alt='Product Image'
                className='w-full h-[400px] object-cover rounded-lg'
                style={{ aspectRatio: '600/600', objectFit: 'contain' }}
              />
            </div>
            <div>
              <h1 className='text-3xl font-bold'>{product}</h1>
              <p className='text-muted-foreground text-lg mt-2'>
                {data?.category}
              </p>
              <div className='flex items-center gap-4 mt-4'>
                <div className='flex items-center gap-0.5'>
                  <StarIcon className='w-5 h-5 fill-primary' />
                  <StarIcon className='w-5 h-5 fill-primary' />
                  <StarIcon className='w-5 h-5 fill-primary' />
                  <StarIcon className='w-5 h-5 fill-muted stroke-muted-foreground' />
                  <StarIcon className='w-5 h-5 fill-muted stroke-muted-foreground' />
                </div>
                <span className='text-muted-foreground text-sm'>(4.3)</span>
              </div>
              <div className='mt-6'>
                <span className='text-3xl font-bold'>${data?.price}</span>
              </div>
              <div className='mt-6 flex gap-4'>
                <div className='flex items-center gap-4'>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() =>
                      setQuantity((value) => {
                        if (value === 1) return 1;
                        return value - 1;
                      })
                    }
                  >
                    <MinusIcon className='w-4 h-4' />
                  </Button>
                  <span>{quantity}</span>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <PlusIcon className='w-4 h-4' />
                  </Button>
                </div>
                <Button
                  size='lg'
                  onClick={addItemToCart}
                  disabled={addedLoading}
                >
                  Add to Cart
                </Button>
              </div>
              <div className='mt-8'>
                <h2 className='text-2xl font-bold'>Description</h2>
                <p className='text-muted-foreground text-lg mt-2'>
                  {data?.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
