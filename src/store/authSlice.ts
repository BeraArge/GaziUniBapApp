import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {API_URL} from '../config';

export interface LoginPayload {
  ogrenciNo: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  surname: string;
  ogrenciNo: string;
  phone: string;
  password: string;
  passwordRepeat: string;
}

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: any | null;
  deviceToken: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  deviceToken: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, {rejectWithValue, getState}) => {
    try {
      const state = getState() as {auth: AuthState};
      const deviceToken = state.auth.deviceToken;
      console.log('Attempting login with payload:', payload, 'and deviceToken:', deviceToken);
      const response = await axios.post(`${API_URL}/api/auth/Login`, {
        ogrenciNo: payload.ogrenciNo,
        password: payload.password,
        deviceToken: deviceToken ?? '',
      });
      console.log('login response:', response.data);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        return error.response.data;
      }
      const message = error?.message || 'Giriş yapılırken bir hata oluştu';
      return rejectWithValue(message);
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, {rejectWithValue}) => {
    try {
      const response = await axios.post(`${API_URL}/api/user/Add`, {
        Name: payload.name,
        Surname: payload.surname,
        OgrenciNo: payload.ogrenciNo,
        Phone: payload.phone,
        Password: payload.password,
        PasswordRepeat: payload.passwordRepeat,
      });
      console.log('register response:', response.data);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        return error.response.data;
      }
      const message = error?.message || 'Kayıt olurken bir hata oluştu';
      return rejectWithValue(message);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: state => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.loading = false;
    },

    clearAuthError: state => {
      state.error = null;
    },

    setDeviceToken: (state, action) => {
      state.deviceToken = action.payload;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.isSuccess !== false) {
          const data = action.payload.data;
          state.user = data;
          // Token'ı set et -> RootNavigator otomatik olarak uygulama içine geçer.
          state.token =
            data?.accessToken?.token ?? data?.token ?? action.payload.token ?? null;
          state.error = null;
        } else {
          state.user = null;
          state.token = null;
          state.error = action.payload.message || 'Giriş başarısız';
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Giriş başarısız';
      })

      .addCase(register.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.isSuccess !== false) {
          const data = action.payload.data;
          state.user = data;
          state.token =
            data?.accessToken?.token ?? data?.token ?? action.payload.token ?? null;
          state.error = null;
        } else {
          state.user = null;
          state.token = null;
          state.error = action.payload.message || 'Kayıt başarısız';
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Kayıt başarısız';
      });
  },
});

export const {logout, clearAuthError, setDeviceToken} = authSlice.actions;

export default authSlice.reducer;
