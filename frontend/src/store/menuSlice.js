import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'menu',
  initialState: { items: [] },
  reducers: {
    setMenu: (state, action) => { state.items = action.payload; },
    addDish: (state, action) => { state.items.push(action.payload); },
    updateDish: (state, action) => {
      const idx = state.items.findIndex(i => i.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload;
    },
    removeDish: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload);
    }
  }
});

export const { setMenu, addDish, updateDish, removeDish } = slice.actions;
export default slice.reducer;
