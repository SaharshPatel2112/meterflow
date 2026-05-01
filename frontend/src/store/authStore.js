import { create } from "zustand";

const getStoredUser = () => {
  try {
    const saved = sessionStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const getStoredToken = () => {
  try {
    return sessionStorage.getItem("accessToken") || null;
  } catch {
    return null;
  }
};

const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: getStoredToken(),

  setAuth: (user, token) => {
    sessionStorage.setItem("accessToken", token);
    sessionStorage.setItem("user", JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
