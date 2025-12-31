import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../lib/axios.js'

export const refreshAuth = createAsyncThunk('auth/refresh', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/auth/refresh')
    console.log(res.data);
    return res.data


  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message)
  }
})

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await API.post('/auth/login', credentials)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message)
  }
})

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await API.post('/auth/register', data)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message)
  }
})

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async ({ email, otp }, { rejectWithValue }) => {
  try {
    const res = await API.post('/auth/verify-otp', { email, otp })
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message)
  }
})

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    const res = await API.post('/auth/logout')
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message)
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    status: 'idle',
    loading: true,
    error: null,
    otpStatus: 'idle',

    authIntent: null,
  },
  reducers: {
    setCredentials(state, action) {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
    },
    clearCredentials(state) {
      state.user = null
      state.accessToken = null
    },
    setAuthIntent(state, action) {
      state.authIntent = action.payload
    },
    clearAuthIntent(state) {
      state.authIntent = null
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    updateAvatar: (state, action) => {
      if (state.user) {
        state.user.anhDaiDien = action.payload;
      }
    }

  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshAuth.pending, (state) => { state.loading = true; state.error = null })
      .addCase(refreshAuth.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; state.accessToken = action.payload.accessToken })
      .addCase(refreshAuth.rejected, (state) => { state.loading = false })

      .addCase(login.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(login.fulfilled, (state, action) => { state.status = 'succeeded'; state.user = action.payload.user; state.accessToken = action.payload.accessToken })
      .addCase(login.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload || action.error.message })

      .addCase(register.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(register.fulfilled, (state) => { state.status = 'succeeded' })
      .addCase(register.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload || action.error.message })

      .addCase(verifyOtp.pending, (state) => { state.otpStatus = 'loading'; state.error = null })
      .addCase(verifyOtp.fulfilled, (state) => { state.otpStatus = 'succeeded' })
      .addCase(verifyOtp.rejected, (state, action) => { state.otpStatus = 'failed'; state.error = action.payload || action.error.message })

      .addCase(logout.fulfilled, (state) => { state.user = null; state.accessToken = null })
  }
})

export const { setCredentials, clearCredentials, setAuthIntent, clearAuthIntent, updateProfile, updateAvatar } = authSlice.actions

export default authSlice.reducer
