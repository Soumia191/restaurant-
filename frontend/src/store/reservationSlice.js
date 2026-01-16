import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'reservations',
  initialState: { list: [] },
  reducers: {
    setReservations: (state, action) => { state.list = action.payload; },
    addReservation: (state, action) => { state.list.push(action.payload); },
    updateReservationStatus: (state, action) => {
      const { id, status } = action.payload;
      const idx = state.list.findIndex(r => r.id === id);
      if (idx >= 0) state.list[idx].status = status;
    },
    removeReservation: (state, action) => {
      const id = action.payload;
      state.list = state.list.filter(r => r.id !== id);
    }
  }
});

export const { setReservations, addReservation, updateReservationStatus, removeReservation } = slice.actions;
export default slice.reducer;
