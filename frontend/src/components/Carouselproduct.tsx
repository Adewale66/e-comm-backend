import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const CarouselProduct = ({
  name,
  src,
  price,
  description,
}: {
  name: string;
  src: string;
  price: number;
  description: string;
}) => {
  return (
    <Link
      href={`products/${name.split(' ').join('-').toLocaleLowerCase()}`}
      className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 hover:cursor-pointer'
    >
      <div className='col-span-1 md:col-span-2 lg:col-span-1'>
        <Image
          src={src}
          width={600}
          height={400}
          alt='Featured Product'
          className='w-full h-[300px] md:h-[400px] lg:h-[500px] object-cover rounded-lg'
          style={{ aspectRatio: '600/400', objectFit: 'fill' }}
        />
      </div>
      <div className='col-span-1 md:col-span-1 lg:col-span-2 flex flex-col justify-center gap-4'>
        <h2 className='text-3xl md:text-4xl font-bold'>{name}</h2>
        <p className='text-muted-foreground text-lg'>{description}</p>
        <div className='flex items-center gap-4'>
          <span className='text-2xl font-bold'>${price}</span>
        </div>
      </div>
    </Link>
  );
};

export default CarouselProduct;
