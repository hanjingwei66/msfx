import { defineStore } from 'pinia';

export interface AuthUser {
  username: string;
  name: string;
}

interface AuthState {
  token: string;
  user: AuthUser | null;
}

function readToken(): string {
  try {
    const token = uni.getStorageSync('token');
    return typeof token === 'string' ? token : '';
  } catch {
    return '';
  }
}

function readUser(): AuthUser | null {
  try {
    const user = uni.getStorageSync('user') as AuthUser | null;
    if (user && typeof user === 'object' && user.username) {
      return {
        username: user.username,
        name: user.name || user.username,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: readToken(),
    user: readUser(),
  }),
  getters: {
    /** `Bearer <token>`，未登录时为空字符串 */
    formatToken: state => (state.token ? `Bearer ${state.token}` : ''),
    isLoggedIn: state => Boolean(state.token),
  },
  actions: {
    /**
     * 写入登录态，并同步到本地存储。
     */
    updateSession(payload: { token: string; user?: AuthUser }) {
      this.token = payload.token;
      uni.setStorageSync('token', payload.token);
      if (payload.user) {
        this.user = payload.user;
        uni.setStorageSync('user', payload.user);
      }
    },
    clearSession() {
      this.token = '';
      this.user = null;
      uni.removeStorageSync('token');
      uni.removeStorageSync('user');
    },
    logout() {
      this.clearSession();
      uni.reLaunch({ url: '/pages/login/index' });
    },
  },
});
