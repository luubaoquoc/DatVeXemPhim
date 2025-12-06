import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../lib/axios.js'

export const fetchPhims = createAsyncThunk('phim/fetchPhims', async (params = {}, { rejectWithValue }) => {
  const { page = 1, limit = 10, search = "", trangThaiChieu = "" } = params
  try {
    const res = await API.get('/phim', { params: { page, limit, search, trangThaiChieu } })
    return res.data || []
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message)
  }
})

export const fetchPhimBymaPhim = createAsyncThunk('phim/fetchPhimBymaPhim', async (maPhim, { rejectWithValue }) => {
  try {
    const res = await API.get(`/phim/${maPhim}`)
    // try common shapes
    return res.data?.data || res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message)
  }
})



const phimSlice = createSlice({
  name: 'phim',
  initialState: {
    items: [],
    current: null,
    totalPages: 1,
    totalItems: 0,
    status: 'idle',
    currentStatus: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPhims.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchPhims.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.data || []
        state.totalPages = action.payload.totalPages || 1
        state.totalItems = action.payload.totalItems || 0
      })
      .addCase(fetchPhims.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })

      .addCase(fetchPhimBymaPhim.pending, (state) => {
        state.currentStatus = 'loading'
      })
      .addCase(fetchPhimBymaPhim.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded'
        state.current = action.payload
      })
      .addCase(fetchPhimBymaPhim.rejected, (state, action) => {
        state.currentStatus = 'failed'
        state.error = action.payload
      })


  }
})

export const selectAllPhims = (state) => state.phim.items



export default phimSlice.reducer
