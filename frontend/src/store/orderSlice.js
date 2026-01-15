import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'orders',
  initialState: { list: [] },
  reducers: {
    setOrders: (state, action) => { state.list = action.payload; },
    addOrder: (state, action) => { state.list.push(action.payload); },
    updateOrderStatus: (state, action) => {
      const { id, status } = action.payload;
      const idx = state.list.findIndex(o => o.id === id);
      if (idx >= 0) state.list[idx].status = status;
    }
  }
});

export const { setOrders, addOrder, updateOrderStatus } = slice.actions;
export default slice.reducer;
