import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface ProductInfo {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  total: number;
  products: ProductInfo[];
}

const initialState: Cart = {
  total:
    typeof window !== 'undefined' &&
    global?.localStorage.getItem('guestCartTotal')
      ? JSON.parse(global?.localStorage.getItem('guestCartTotal') as string)
      : 0,
  products:
    typeof window !== 'undefined' && global?.localStorage.getItem('guestCart')
      ? JSON.parse(global?.localStorage.getItem('guestCart') as string)
      : [],
};

const guestCartSlice = createSlice({
  name: 'guestCart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<ProductInfo>) => {
      state.products.push(action.payload);
      state.total += action.payload.price * action.payload.quantity;
      global.localStorage.setItem('guestCart', JSON.stringify(state.products));
      global.localStorage.setItem(
        'guestCartTotal',
        JSON.stringify(state.total),
      );
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) => {
      const product = state.products.find(
        (product) => product.productId === action.payload.productId,
      );
      if (product) {
        state.total -= product.subtotal;
        product.subtotal = product.price * action.payload.quantity;
        product.quantity = action.payload.quantity;
        state.total += product.subtotal;
        global.localStorage.setItem(
          'guestCart',
          JSON.stringify(state.products),
        );
        global.localStorage.setItem(
          'guestCartTotal',
          JSON.stringify(state.total),
        );
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.total -=
        state.products.find((product) => product.productId === action.payload)
          ?.subtotal || 0;
      state.products = state.products.filter(
        (product) => product.productId !== action.payload,
      );
      global.localStorage.setItem('guestCart', JSON.stringify(state.products));
      global.localStorage.setItem(
        'guestCartTotal',
        JSON.stringify(state.total),
      );
    },

    clearCart: (state) => {
      state.products = [];
      state.total = 0;
      global.localStorage.setItem('guestCart', JSON.stringify(state.products));
      global.localStorage.setItem(
        'guestCartTotal',
        JSON.stringify(state.total),
      );
    },
  },
});

export const { addToCart, removeFromCart, clearCart, updateQuantity } =
  guestCartSlice.actions;
export default guestCartSlice.reducer;
