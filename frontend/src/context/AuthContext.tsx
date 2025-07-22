"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "@/services/api";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  gender?: string;
  date_of_birth?: string;
  phone_number?: string;
  country?: string;
  city?: string;
  known_conditions?: string[];
  allergies?: string[];
  medication?: string[];
  privacy_consent?: boolean;
  profile_pic?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean; // This will be true until the token is loaded from storage
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true

  useEffect(() => {
    // On initial load, try to get the token from localStorage
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
    // We are done checking for the initial token
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // This effect runs whenever the token changes
    const fetchUser = async () => {
      if (token) {
        try {
          const { data } = await apiClient.get<User>("/users/me");
          setUser(data);
        } catch (error) {
          console.error("Failed to fetch user, token might be invalid.", error);
          logout(); // The token is invalid, so log out
        }
      }
    };
    fetchUser();
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setToken(newToken); // This will trigger the useEffect above to fetch user data
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    delete apiClient.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export type { User }; 