import React from 'react';

const Loader = () => {
  return (
    <div className='flex items-center justify-center'>
      <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
    </div>
  );
};

export default Loader;
