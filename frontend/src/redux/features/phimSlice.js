import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../lib/axios.js'

export const fetchPhims = createAsyncThunk('phim/fetchPhims', async (params = {}, { rejectWithValue }) => {
  const { page = 1, limit = 10, search = "" } = params
  try {
    const res = await API.get('/phim', { params: { page, limit, search } })
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
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchPhimBymaPhim.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.current = action.payload

      })
      .addCase(fetchPhimBymaPhim.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
  }
})

export const selectAllPhims = (state) => state.phim.items

// When selecting a phim by id, prefer the item from the list; fall back to
// `current` (the single movie loaded by the detail page) if not present in
// the list. This avoids losing list data when user reloads on detail.
export const selectPhimBymaPhim = (state, maPhim) => {
  const fromList = state.phim.items.find(m => String(m.maPhim) === String(maPhim) || String(m._maPhim) === String(maPhim))
  if (fromList) return fromList
  const cur = state.phim.current
  if (cur && (String(cur.maPhim) === String(maPhim) || String(cur._maPhim) === String(maPhim))) return cur
  return undefined
}

export default phimSlice.reducer
