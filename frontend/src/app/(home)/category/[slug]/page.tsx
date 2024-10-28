'use client';

import Loader from '../../../../components/Loader';
import Product from '../../../../components/Product';
import { useGetAllProductsQuery } from '../../../../lib/slices/productsSlice';

const Page = ({ params }: { params: { slug: string } }) => {
  const category = params.slug;

  const { data: products, isLoading } = useGetAllProductsQuery({
    category,
    page: '1',
  });

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
      <section className='  flex justify-center'>
        <div className='container px-4 md:px-6'>
          <div className='flex flex-col items-center text-center gap-4 mb-8 mt-6'>
            <h2 className='text-3xl md:text-4xl font-bold'>
              All {capitalizeFirstLetter(category)} P roducts
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
    </main>
  );
};

export default Page;
