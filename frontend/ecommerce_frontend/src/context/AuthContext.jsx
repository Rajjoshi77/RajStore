import { createContext, useContext, useMemo, useState } from "react";

import { getToken, logout, getUser } from "../services/auth";


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize synchronously from localStorage so protected routes
  // don't redirect before we read stored credentials.
  const initialUser = getUser();
  const initialAuthed = !!getToken() && !!initialUser;

  const [authed, setAuthed] = useState(initialAuthed);
  const [user, setUser] = useState(initialUser);

  const doLogout = () => {
    logout();
    setAuthed(false);
    setUser(null);
  };

  const loginSuccess = () => {
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
      setAuthed(true);
    } else {
      setUser(null);
      setAuthed(false);
    }
  };

  const value = useMemo(
    () => ({
      authed,
      user,
      logout: doLogout,
      loginSuccess,
    }),
    [authed, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

