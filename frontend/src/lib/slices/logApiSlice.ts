import { apiSlice } from './apiSlice';

interface Credentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginResponse {
  status: string;
  message: string;
  data: {
    name: string;
    email: string;
    access_token: string;
  };
}

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      LoginResponse,
      Omit<Credentials, 'firstName' | 'lastName'>
    >({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    register: builder.mutation<void, Credentials>({
      query: (credentials) => ({
        url: 'auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),

    sendOtpCode: builder.mutation<void, { email: string }>({
      query: (credentials) => ({
        url: 'auth/forgot-password',
        method: 'POST',
        body: credentials,
      }),
    }),

    verifyOtp: builder.mutation<void, { code: string }>({
      query: (credentials) => ({
        url: 'auth/verify-otp',
        method: 'POST',
        body: credentials,
      }),
    }),

    resetPassword: builder.mutation<
      void,
      Omit<Credentials, 'firstName' | 'lastName'>
    >({
      query: (credentials) => ({
        url: 'auth/reset-password',
        method: 'PATCH',
        body: credentials,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSendOtpCodeMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} = authApiSlice;
