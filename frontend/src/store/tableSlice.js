import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'tables',
  initialState: { list: [] },
  reducers: {
    setTables: (state, action) => {
      state.list = action.payload;
    },
    addTable: (state, action) => {
      state.list.push(action.payload);
    },
    updateTable: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.list.findIndex(t => t.id === id);
      if (index >= 0) {
        state.list[index] = { ...state.list[index], ...updates };
      }
    },
    setAvailability: (state, action) => {
      const { id, available } = action.payload;
      const index = state.list.findIndex(t => t.id === id);
      if (index >= 0) {
        state.list[index].available = available;
      }
    },
    removeTable: (state, action) => {
      state.list = state.list.filter(t => t.id !== action.payload);
    }
  }
});

export const { setTables, addTable, updateTable, setAvailability, removeTable } = slice.actions;
export default slice.reducer;
