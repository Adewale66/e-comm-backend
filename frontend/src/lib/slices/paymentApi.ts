import { apiSlice } from './apiSlice';
import { ProductInfo } from './guestCart';

interface Order {
  order_number: string;
  order_status: string;
  created_at: string;
  products: ProductInfo[];
  total: number;
}

export const paymentSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    checkout: builder.mutation<{ data: { payment_url: string } }, void>({
      query: () => ({
        url: 'payment/stripe/checkout',
        method: 'POST',
      }),
    }),

    verifyPayment: builder.query<
      { data: { status: string } },
      { session_id: string }
    >({
      query: (session_id) => `payment/stripe/verify?session_id=${session_id}`,
    }),

    getOrders: builder.query<Order[], void>({
      query: () => 'orders',
    }),
  }),
});

export const { useCheckoutMutation, useVerifyPaymentQuery, useGetOrdersQuery } =
  paymentSlice;
