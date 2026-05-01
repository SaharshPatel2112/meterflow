import { create } from "zustand";

// Read from sessionStorage (per-tab)
const savedUser = sessionStorage.getItem("user");
const savedToken = sessionStorage.getItem("accessToken");

const useAuthStore = create((set) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,

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
