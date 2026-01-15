import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import menuReducer from './menuSlice';
import reservationReducer from './reservationSlice';
import tableReducer from './tableSlice';
import orderReducer from './orderSlice';
import cartReducer from './cartSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
    reservations: reservationReducer,
    tables: tableReducer,
    orders: orderReducer,
    cart: cartReducer,
  }
});

export default store;
