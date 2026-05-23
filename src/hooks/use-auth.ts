import { useState, useEffect } from 'react';
import { z } from 'zod';

const passwordSchema = z.string().min(1, "Password is required");

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        const auth = JSON.parse(atob(storedAuth));
        if (auth.isAuthenticated) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to parse auth from localStorage", error);
      }
    }
  }, []);

  const login = (password: string) => {
    const validation = passwordSchema.safeParse(password);
    if (!validation.success) {
      throw new Error(validation.error.errors[0].message);
    }

    const correctPassword = import.meta.env.VITE_APP_PASSWORD;
    if (password === correctPassword) {
      const auth = { isAuthenticated: true, timestamp: Date.now() };
      localStorage.setItem('auth', btoa(JSON.stringify(auth)));
      setIsAuthenticated(true);
    } else {
      throw new Error("Incorrect password");
    }
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
}
