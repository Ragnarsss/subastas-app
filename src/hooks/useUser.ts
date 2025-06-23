import { useState, useEffect, useCallback } from "react";
import { gql } from "graphql-request";
import { client } from "../graphQLClient";

// User interface matching GraphQL schema
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

// Extended interface for display purposes
interface UserDisplay extends User {
  avatar?: string;
  rating?: number;
  isActive?: boolean;
}

// GraphQL Queries
const GET_USER_BY_ID = gql`
  query GetUserById($id: String!) {
    getUserById(id: $id) {
      id
      email
      name
      role
      createdAt
      updatedAt
    }
  }
`;

const GET_ALL_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      id
      email
      name
      role
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_MY_PROFILE_MUTATION = gql`
  mutation UpdateMyProfile(
    $token: String!
    $name: String
    $email: String
    $new_password: String
  ) {
    updateMyProfile(
      token: $token
      name: $name
      email: $email
      new_password: $new_password
    ) {
      id
      email
      name
      role
      createdAt
      updatedAt
    }
  }
`;

interface UseUserReturn {
  user: UserDisplay | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  clearError: () => void;
}

interface UseUsersReturn {
  users: UserDisplay[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

// Hook for getting user information by ID
export const useUser = (userId?: string): UseUserReturn => {
  const [user, setUser] = useState<UserDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use provided userId or get from localStorage
      const targetUserId = userId || localStorage.getItem("userId");

      if (!targetUserId) {
        throw new Error("No user ID provided");
      }

      const data = await client.request(GET_USER_BY_ID, { id: targetUserId });

      // Transform GraphQL response to display format
      const userDisplay: UserDisplay = {
        ...data.getUserById,
        avatar: `https://ui-avatars.io/api/?name=${encodeURIComponent(
          data.getUserById.name
        )}&background=1976d2&color=fff`, // placeholder
        rating: 4.5, // placeholder
        isActive: true, // placeholder
      };

      setUser(userDisplay);
    } catch (err: any) {
      const errorMessage =
        err.response?.errors?.[0]?.message ||
        err.message ||
        "Error fetching user";
      setError(errorMessage);
      console.error("Error fetching user:", err);

      // Mock data for development/fallback
      const mockUser: UserDisplay = {
        id: userId || localStorage.getItem("userId") || "user_default",
        email: "usuario@ejemplo.com",
        name: "Usuario Demo",
        role: "USER",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatar:
          "https://ui-avatars.io/api/?name=Usuario+Demo&background=1976d2&color=fff",
        rating: 4.5,
        isActive: true,
      };
      setUser(mockUser);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateUser = useCallback(
    async (
      userData: Partial<User & { new_password?: string }>
    ): Promise<boolean> => {
      try {
        setError(null);

        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No access token found");
        }

        const data = await client.request(UPDATE_MY_PROFILE_MUTATION, {
          token,
          name: userData.name,
          email: userData.email,
          new_password: userData.new_password,
        });

        // Transform and update user
        const userDisplay: UserDisplay = {
          ...data.updateMyProfile,
          avatar:
            user?.avatar ||
            `https://ui-avatars.io/api/?name=${encodeURIComponent(
              data.updateMyProfile.name
            )}&background=1976d2&color=fff`,
          rating: user?.rating || 4.5,
          isActive: user?.isActive || true,
        };

        setUser(userDisplay);
        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.errors?.[0]?.message ||
          err.message ||
          "Error updating user";
        setError(errorMessage);
        console.error("Error updating user:", err);
        return false;
      }
    },
    [user]
  );

  const refetch = useCallback(() => fetchUser(), [fetchUser]);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    refetch,
    updateUser,
    clearError,
  };
};

// Hook for getting current authenticated user
export const useCurrentUser = (): UseUserReturn => {
  return useUser(); // Uses userId from localStorage
};

// Hook for getting multiple users (admin use case)
export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<UserDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await client.request(GET_ALL_USERS);

      // Transform GraphQL response to display format
      const usersDisplay: UserDisplay[] = data.getAllUsers.map(
        (user: User) => ({
          ...user,
          avatar: `https://ui-avatars.io/api/?name=${encodeURIComponent(
            user.name
          )}&background=1976d2&color=fff`,
          rating: 4.5,
          isActive: true,
        })
      );

      setUsers(usersDisplay);
    } catch (err: any) {
      const errorMessage =
        err.response?.errors?.[0]?.message ||
        err.message ||
        "Error fetching users";
      setError(errorMessage);
      console.error("Error fetching users:", err);

      // Mock data for development
      const mockUsers: UserDisplay[] = [
        {
          id: "user_1",
          email: "usuario1@ejemplo.com",
          name: "Juan Pérez",
          role: "USER",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          avatar:
            "https://ui-avatars.io/api/?name=Juan+Pérez&background=1976d2&color=fff",
          rating: 4.8,
          isActive: true,
        },
        {
          id: "user_2",
          email: "usuario2@ejemplo.com",
          name: "María González",
          role: "USER",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          avatar:
            "https://ui-avatars.io/api/?name=María+González&background=1976d2&color=fff",
          rating: 4.9,
          isActive: true,
        },
      ];
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => fetchUsers(), [fetchUsers]);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch,
    clearError,
  };
};

// Hook for user authentication status
export const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  return {
    isAuthenticated,
    loading,
  };
};
