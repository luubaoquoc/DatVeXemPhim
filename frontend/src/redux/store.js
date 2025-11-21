import { configureStore } from '@reduxjs/toolkit'
import phimReducer from './features/phimSlice'
import authReducer from './features/authSlice'

const store = configureStore({
  reducer: {
    phim: phimReducer,
    auth: authReducer,
  },
})

export default store
