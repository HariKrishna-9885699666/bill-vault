import { useState, useEffect } from "react";
import { z } from "zod";

const passwordSchema = z.string().min(1, "Password is required");

// Module-level singleton — shared across every useAuth() call
let _isAuthenticated = (() => {
  try {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const auth = JSON.parse(atob(stored));
      return !!auth.isAuthenticated;
    }
  } catch (e) {
    // ignore
  }
  return false;
})();

const _subscribers = new Set<() => void>();

function setAuth(next: boolean) {
  _isAuthenticated = next;
  _subscribers.forEach((fn) => fn());
}

export function useAuth() {
  const [, rerender] = useState(0);

  useEffect(() => {
    const handler = () => rerender((n) => n + 1);
    _subscribers.add(handler);
    return () => {
      _subscribers.delete(handler);
    };
  }, []);

  const login = (password: string) => {
    const validation = passwordSchema.safeParse(password);
    if (!validation.success) {
      throw new Error(validation.error.errors[0].message);
    }
    const correctPassword = import.meta.env.VITE_APP_PASSWORD;
    if (password === correctPassword) {
      localStorage.setItem(
        "auth",
        btoa(JSON.stringify({ isAuthenticated: true, timestamp: Date.now() })),
      );
      setAuth(true);
    } else {
      throw new Error("Incorrect password");
    }
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setAuth(false);
  };

  return { isAuthenticated: _isAuthenticated, login, logout };
}
