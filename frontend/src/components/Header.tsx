'use client';

import Link from 'next/link';
import { MountainIcon, SearchIcon, ShoppingCartIcon } from './icons';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import Searchbar from './Searchbar';
import { useGetCartQuery } from '../lib/slices/cartApiSlice';
import { RootState } from '../lib/store';
import { useSelector } from 'react-redux';
import { Cart } from '../lib/slices/guestCart';
import { useEffect, useState } from 'react';

const Userdropdown = dynamic(() => import('./userdropdown'), { ssr: false });

const Header = () => {
  const { data } = useGetCartQuery();
  const user = useSelector((state: RootState) => state.auth.userInfo);
  const guestCart = useSelector((state: RootState) => state.guestCart);
  const [cart, setCart] = useState<Cart>();

  useEffect(() => {
    if (user) {
      setCart(data || { total: 0, products: [] });
    } else {
      setCart(guestCart);
    }
  }, [data, user, guestCart]);

  return (
    <header className='bg-background border-b shadow-sm sticky top-0 z-30 flex justify-center'>
      <div className='container px-4 md:px-6 flex items-center h-14 lg:h-16'>
        <Link
          href='/'
          className='mr-6 flex items-center gap-2'
          prefetch={false}
        >
          <MountainIcon className='h-6 w-6' />
          <span className='text-lg font-semibold'>Acme Ecommerce</span>
        </Link>
        <nav className='ml-auto hidden lg:flex items-center gap-6 text-sm font-medium'>
          <Link
            href='/'
            className='hover:underline underline-offset-4'
            prefetch={false}
          >
            Home
          </Link>
          <Link
            href='/products'
            className='hover:underline underline-offset-4'
            prefetch={false}
          >
            Shop
          </Link>
          <Link
            href='/#'
            className='hover:underline underline-offset-4'
            prefetch={false}
          >
            About
          </Link>
          <Link
            href='/#'
            className='hover:underline underline-offset-4'
            prefetch={false}
          >
            Contact
          </Link>
        </nav>
        <Searchbar />
        <div className='ml-4 lg:hidden'>
          <Button size='icon' variant='ghost'>
            <SearchIcon className='w-6 h-6' />
            <span className='sr-only'>Search</span>
          </Button>
        </div>
        <Userdropdown />
        <div className='ml-4 relative'>
          <Link
            href='/cart'
            className='flex items-center gap-2 hover:underline underline-offset-4 relative
		  '
          >
            <ShoppingCartIcon className='w-6 h-6' />
            <span className='sr-only'>Cart</span>
            {cart && cart.products.length > 0 && (
              <span className='absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-medium'>
                {cart.products.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
