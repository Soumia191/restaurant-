import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'auth',
  initialState: { user: null },
  reducers: {
    login: (state, action) => {
      state.user = {
        id: action.payload.id,
        email: action.payload.email,
        role: action.payload.role,
        name: action.payload.name,
        token: action.payload.token
      };
    },
    logout: (state) => {
      state.user = null;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  }
});

export const { login, logout, updateUser } = slice.actions;
export default slice.reducer;
