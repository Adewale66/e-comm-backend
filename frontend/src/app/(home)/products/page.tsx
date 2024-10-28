'use client';

import Product from '../../../components/Product';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import { useGetAllProductsQuery } from '../../../lib/slices/productsSlice';
import Loader from '../../../components/Loader';
import { useSearchParams } from 'next/navigation';

const Page = () => {
  const searchParams = useSearchParams();

  const page = searchParams.get('page') || '1';

  const { data: products, isLoading } = useGetAllProductsQuery({
    category: '',
    page,
  });

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full w-full my-auto'>
        <Loader />
      </div>
    );
  }

  return (
    <main>
      <section className='  flex justify-center'>
        <div className='container px-4 md:px-6'>
          <div className='flex flex-col items-center text-center gap-4 mb-8'>
            <h2 className='text-3xl md:text-4xl font-bold mt-4'>
              All Products
            </h2>
            <p className='text-muted-foreground text-lg max-w-md'>
              Browse through our extensive collection of high-quality products
              to find the perfect fit for your needs.
            </p>
          </div>

          <div className='flex flex-wrap gap-6'>
            {products?.map((product, i) => (
              <Product
                id={product.id}
                name={product.title}
                price={product.price}
                description={product.description}
                imageSrc={product.image}
                key={i}
                rating={Math.floor(Math.random() * 5) + 1}
              />
            ))}
          </div>
        </div>
      </section>

      <Pagination className='mb-4'>
        <PaginationContent>
          {page !== '1' && (
            <>
              <PaginationItem>
                <PaginationPrevious
                  href={'/products?page=' + (parseInt(page) - 1)}
                  className='hover:cursor-pointer'
                />
              </PaginationItem>
            </>
          )}
          <PaginationItem>
            <PaginationLink
              className='hover:cursor-pointer'
              isActive={page === '1'}
              href='/products?page=1'
            >
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              href='/products?page=2'
              className='hover:cursor-pointer'
              isActive={page === '2'}
            >
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              href='/products?page=3'
              className='hover:cursor-pointer'
              isActive={page === '3'}
            >
              3
            </PaginationLink>
          </PaginationItem>
          {page !== '3' && (
            <>
              <PaginationItem>
                <PaginationNext
                  href={'/products?page=' + (parseInt(page) + 1)}
                  className='hover:cursor-pointer'
                />
              </PaginationItem>
            </>
          )}
        </PaginationContent>
      </Pagination>
    </main>
  );
};

export default Page;
