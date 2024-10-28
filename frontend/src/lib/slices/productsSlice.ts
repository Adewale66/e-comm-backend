import { apiSlice } from './apiSlice';

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  price: number;
  tag: string;
}

export const prouctsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllProducts: builder.query<
      Product[],
      { category: string; page: string }
    >({
      query: (data) =>
        'products?category=' + data.category + '&page=' + data.page,
    }),

    getProduct: builder.query<Product, { tag: string }>({
      query: (data) => 'products/' + data.tag,
    }),
  }),
});

export const { useGetAllProductsQuery, useGetProductQuery } = prouctsApi;
