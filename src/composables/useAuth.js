import { ref, readonly } from "vue";

const isAuthModalVisible = ref(false);
const isLoggedIn = ref(false);
const currentUser = ref(null);
let routerInstance = null;

const getToken = () => {
  return localStorage.getItem('token');
};

const setLoggedIn = (user, token) => {
  isLoggedIn.value = true;
  currentUser.value = user;
  localStorage.setItem('token', token);
};

const logout = () => {
  isLoggedIn.value = false;
  currentUser.value = null;
  localStorage.removeItem('token');
  if (routerInstance) routerInstance.push('/');
};

const checkToken = () => {
  const token = getToken();
  if (!token) {
    logout();
    return false;
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now().valueOf() / 1000;
    if (typeof payload.exp !== 'undefined' && payload.exp < now) {
      logout();
      return false;
    }
    isLoggedIn.value = true;
    return true;
  } catch (error) {
    console.error('解析 token 失败', error);
    logout();
    return false;
  }
};

export const auth = {
  isAuthModalVisible: readonly(isAuthModalVisible),
  isLoggedIn: readonly(isLoggedIn),
  currentUser: readonly(currentUser),

  getToken,

  showAuthModal: () => {
    console.log('showAuthModal called, isAuthModalVisible before:', isAuthModalVisible.value);
    isAuthModalVisible.value = true;
    console.log('showAuthModal called, isAuthModalVisible after:', isAuthModalVisible.value);
  },

  hideAuthModal: () => {
    isAuthModalVisible.value = false;
  },

  setLoggedIn,
  logout,

  handleLoginSuccess: (user, token) => {
    setLoggedIn(user, token);
    isAuthModalVisible.value = false;
    if (routerInstance) routerInstance.push('/');
  },

  checkAuth: () => {
    checkToken();
    return isLoggedIn.value;
  },

  setRouter: (router) => {
    routerInstance = router;
  }
}

export function useAuth() {
  return auth;
}