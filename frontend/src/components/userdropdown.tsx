'use client';

import { useDispatch, useSelector } from 'react-redux';
import { removeCredentials } from '../lib/slices/authSlice';
import { RootState } from '../lib/store';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Avatar, AvatarFallback } from './ui/avatar';
import Link from 'next/link';
import { CommandIcon, LogOutIcon, UserIcon } from './icons';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

const Userdropdown = () => {
  const user = useSelector((state: RootState) => state.auth.userInfo);
  const dispatch = useDispatch();
  const [showPopover, setShowPopover] = useState(false);
  const [isLoggedin, setIsLoggedin] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLoggedin(true);
    }
  }, [user]);

  function logout() {
    dispatch(removeCredentials());
    setIsLoggedin(false);
  }

  if (!isLoggedin) {
    return (
      <Link
        href='/auth/signin'
        className='hover:underline underline-offset-4 ml-4'
        prefetch={false}
      >
        Login
      </Link>
    );
  }

  return (
    <div className='ml-4'>
      <Popover open={showPopover} onOpenChange={setShowPopover}>
        <PopoverTrigger asChild>
          <Button size='icon' variant='ghost'>
            <UserIcon className='w-6 h-6' />
            <span className='sr-only'>User</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80 p-4'>
          <div className='flex items-center gap-4'>
            <Avatar>
              <AvatarFallback>
                {user?.name
                  .split(' ')
                  .map((x) => x[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className='font-medium'>{user?.name}</h4>
              <p className='text-sm text-muted-foreground'>{user?.email}</p>
            </div>
          </div>
          <Separator className='my-4' />
          <div className='grid gap-2'>
            <Link
              href='/orders'
              className='flex items-center gap-2 hover:bg-muted rounded-md p-2'
              prefetch={false}
            >
              <CommandIcon className='w-5 h-5' />
              <span>Orders</span>
            </Link>
            <span
              className='flex items-center gap-2 hover:bg-muted rounded-md p-2 hover:cursor-pointer'
              onClick={logout}
            >
              <LogOutIcon className='w-5 h-5' />
              <span>Logout</span>
            </span>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Userdropdown;
