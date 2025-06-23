import { gql } from "graphql-request";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { client } from "../graphqlClient";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  avatar?: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      access_token
      refresh_token
      expires_in
    }
  }
`;

const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      role
      createdAt
      updatedAt
    }
  }
`;

const GET_MY_PROFILE_QUERY = gql`
  query GetMyProfile($token: String!) {
    getMyProfile(token: $token) {
      id
      name
      email
      role
      createdAt
      updatedAt
    }
  }
`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing tokens on app load
    const token = localStorage.getItem("access_token");
    if (token) {
      // Set authorization header
      client.setHeader("Authorization", `Bearer ${token}`);
      // Try to get user info
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found");
      }

      const data = await client.request(GET_MY_PROFILE_QUERY, { token });
      const userData = {
        ...data.getMyProfile,
        avatar: `https://ui-avatars.io/api/?name=${encodeURIComponent(
          data.getMyProfile.name
        )}&background=1976d2&color=fff`,
      };
      setUser(userData);

      // Store user ID for useUser hook
      localStorage.setItem("userId", userData.id);
    } catch (error) {
      console.error("Error fetching user:", error);
      // Token might be expired, clear it
      clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const setTokens = (authResponse: AuthResponse) => {
    localStorage.setItem("access_token", authResponse.access_token);
    localStorage.setItem("refresh_token", authResponse.refresh_token);
    localStorage.setItem("expires_in", authResponse.expires_in.toString());
    localStorage.setItem("login_time", Date.now().toString());

    // Set authorization header for future requests
    client.setHeader("Authorization", `Bearer ${authResponse.access_token}`);
  };

  const clearTokens = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("expires_in");
    localStorage.removeItem("login_time");
    localStorage.removeItem("userId");

    // Remove authorization header
    client.setHeader("Authorization", "");
    setUser(null);
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const data = await client.request(LOGIN_MUTATION, { email, password });

      setTokens(data.login);
      await fetchUser();

      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        error:
          error.response?.errors?.[0]?.message || "Error al iniciar sesión",
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // First create the user
      const userData = await client.request(CREATE_USER_MUTATION, {
        input: {
          name,
          email,
          password,
          role: "USER",
        },
      });

      // Then login with the same credentials to get tokens
      const loginData = await client.request(LOGIN_MUTATION, {
        email,
        password,
      });

      setTokens(loginData.login);
      await fetchUser();

      return { success: true };
    } catch (error: any) {
      console.error("Register error:", error);
      return {
        success: false,
        error: error.response?.errors?.[0]?.message || "Error al registrarse",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearTokens();
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) return false;

      // TODO: Implement refresh token mutation when available
      // const data = await client.request(REFRESH_TOKEN_MUTATION, { refresh_token: refreshToken });
      // setTokens(data.refreshToken);

      return true;
    } catch (error) {
      console.error("Token refresh error:", error);
      clearTokens();
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
