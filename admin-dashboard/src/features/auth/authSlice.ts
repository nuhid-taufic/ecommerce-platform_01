import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Function to fetch real user data from the backend
export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const storedUser = localStorage.getItem("adminUser");
      const token = localStorage.getItem("adminToken");

      if (storedUser && token) {
        return JSON.parse(storedUser);
      } else {
        return rejectWithValue("Not authenticated");
      }
    } catch (error) {
      return rejectWithValue("Auth error");
    }
  },
);

const initialState = {
  user: null as any,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Clear user from local state and storage
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminToken");
    },
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem("adminUser", JSON.stringify(action.payload.user));
      localStorage.setItem("adminToken", action.payload.token);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload; // Google data is saved here
        state.isAuthenticated = true;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearUser, setUser } = authSlice.actions;
export default authSlice.reducer;
