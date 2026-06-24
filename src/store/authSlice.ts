import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {API_URL} from '../config';

export interface LoginPayload {
  ogrenciNo: string;
  password: string;
}

export interface RegisterPayload {
  UserName: string;
  Name: string;
  Surname: string;
  OgrenciNo: string;
  Phone: string;
  Password: string;
  PasswordRepeat: string;
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
      console.log('Attempting registration with payload:', payload);  
      const response = await axios.post(`${API_URL}/api/user/Add`, {
        UserName: payload.UserName,
        Name: payload.Name,
        Surname: payload.Surname,
        OgrenciNo: payload.OgrenciNo,
        Phone: payload.Phone,
        Password: payload.Password,
        PasswordRepeat: payload.PasswordRepeat,
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

/**
 * Şifremi unuttum: telefon numarasıyla sıfırlama talebi gönderir.
 * POST /api/auth/sifremi-unuttum  body: { phone }
 * Ortak login/register loading'ini etkilememek için ekran kendi yerel
 * loading'ini tutar; burada yalnızca isteği atıp yanıtı döndürürüz.
 */
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (payload: {phone: string}, {rejectWithValue}) => {
    try {
      console.log('Attempting forgotPassword with payload:', payload);
      const response = await axios.post(
        `${API_URL}/api/auth/sifremi-unuttum`,
        {phone: payload.phone},
      );
      console.log('forgotPassword response:', response.data);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        return rejectWithValue(error.response.data);
      }
      const message = error?.message || 'İşlem sırasında bir hata oluştu';
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
