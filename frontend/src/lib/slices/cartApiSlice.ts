import { apiSlice } from './apiSlice';
import { Cart } from './guestCart';

export const cartApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<Cart, void>({
      query: () => 'cart',
      providesTags: ['Cart'],
    }),

    addToCart: builder.mutation<void, { productId: string; quantity: number }>({
      query: (payload) => ({
        url: 'cart/items',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Cart'],
    }),

    updateQuantity: builder.mutation<
      void,
      { productId: string; quantity: number }
    >({
      query: (payload) => ({
        url: 'cart/items/' + payload.productId,
        method: 'PUT',
        body: { quantity: payload.quantity },
      }),
      invalidatesTags: ['Cart'],
    }),

    addBulk: builder.mutation<
      void,
      { products: { productId: string; quantity: number }[] }
    >({
      query: (payload) => ({
        url: 'cart/items',
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['Cart'],
    }),

    removeFromCart: builder.mutation<void, { productId: string }>({
      query: (payload) => ({
        url: 'cart/items/' + payload.productId,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    clearCart: builder.mutation<void, void>({
      query: () => ({
        url: 'cart',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateQuantityMutation,
  useAddBulkMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApiSlice;
