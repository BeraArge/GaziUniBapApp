import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from './hooks';
import {
  LoginPayload,
  RegisterPayload,
  login as loginThunk,
  logout as logoutAction,
  register as registerThunk,
} from './authSlice';

/**
 * Ekranlar için redux destekli kimlik doğrulama arayüzü.
 *
 * NOT: Başarılı login'de manuel yönlendirme yapılmaz. login.fulfilled içinde
 * state.token set edilir; RootNavigator token dolu olunca otomatik olarak
 * MainStack'e (uygulama içine) geçer. Hata olursa state.error dolar ve ilgili
 * ekran Alert gösterir.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const {user, token, loading, error} = useAppSelector(s => s.auth);

  const login = useCallback(
    (payload: LoginPayload) => dispatch(loginThunk(payload)),
    [dispatch],
  );

  const register = useCallback(
    (payload: RegisterPayload) => dispatch(registerThunk(payload)),
    [dispatch],
  );

  const logout = useCallback(() => dispatch(logoutAction()), [dispatch]);

  return {user, token, loading, error, login, register, logout};
}
