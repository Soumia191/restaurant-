import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addToCart: (state, action) => {
      const { dish, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.dish.id === dish.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ dish, quantity });
      }
    },
    removeFromCart: (state, action) => {
      const dishId = action.payload;
      state.items = state.items.filter(item => item.dish.id !== dishId);
    },
    updateQuantity: (state, action) => {
      const { dishId, quantity } = action.payload;
      const item = state.items.find(item => item.dish.id === dishId);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.dish.id !== dishId);
        } else {
          item.quantity = quantity;
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    }
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = slice.actions;
export default slice.reducer;
