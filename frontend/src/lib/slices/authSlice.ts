import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface UserInfo {
  userInfo: {
    name: string;
    email: string;
    access_token: string;
  } | null;
}
interface UserToken {
  name: string;
  email: string;
  access_token: string;
}
const initialState: UserInfo = {
  userInfo:
    typeof window !== 'undefined' && global?.localStorage.getItem('userInfo')
      ? JSON.parse(global?.localStorage.getItem('userInfo') as string)
      : null,
};
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<UserToken>) => {
      state.userInfo = action.payload;
      global.localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    removeCredentials: (state) => {
      state.userInfo = null;
      global.localStorage.removeItem('userInfo');
    },
  },
});

export const { setCredentials, removeCredentials } = authSlice.actions;
export default authSlice.reducer;
