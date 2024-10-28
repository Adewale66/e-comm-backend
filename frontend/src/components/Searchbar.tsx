import React, { useState } from 'react';
import { SearchIcon } from './icons';
import { Input } from './ui/input';

const Searchbar = () => {
  const [search, setSearch] = useState('');
  return (
    <div className='ml-auto relative hidden lg:block'>
      <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
      <Input
        type='search'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder='Search products...'
        className='pl-10 pr-4 bg-muted rounded-md w-72 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary'
      />
    </div>
  );
};

export default Searchbar;
