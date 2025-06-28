import { useState, useEffect, useCallback } from "react";
import { gql } from "graphql-request";
import { client } from "../graphqlClient";

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

// GraphQL response interfaces
interface GetUserByIdResponse {
  getUserById: User;
}

interface GetAllUsersResponse {
  getAllUsers: User[];
}

interface UpdateMyProfileResponse {
  updateMyProfile: User;
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

      const data = await client.request(GET_USER_BY_ID, { id: targetUserId }) as GetUserByIdResponse;

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
        }) as UpdateMyProfileResponse;

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

      const data = await client.request(GET_ALL_USERS) as GetAllUsersResponse;

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

// Cache for users to avoid repeated requests
const userCache = new Map<string, UserDisplay>();

// Hook for getting user by ID with caching
export const useUserById = (userId: string): UseUserReturn => {
  const [user, setUser] = useState<UserDisplay | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Check cache first
    if (userCache.has(userId)) {
      setUser(userCache.get(userId)!);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await client.request(GET_USER_BY_ID, { id: userId }) as GetUserByIdResponse;
      
      if (data.getUserById) {
        const userDisplay: UserDisplay = {
          ...data.getUserById,
          avatar: `https://ui-avatars.io/api/?name=${encodeURIComponent(
            data.getUserById.name
          )}&background=1976d2&color=fff`,
          rating: 4.5,
          isActive: true,
        };

        userCache.set(userId, userDisplay);
        setUser(userDisplay);
      } else {
        setUser(null);
        setError("Usuario no encontrado");
      }
    } catch (err: any) {
      console.error("Error fetching user:", err);
      const errorMessage =
        err.response?.errors?.[0]?.message ||
        err.message ||
        "Error al obtener usuario";
      setError(errorMessage);
      
      // Fallback user for display
      const fallbackUser: UserDisplay = {
        id: userId,
        email: "",
        name: `Usuario ${userId.substring(0, 8)}`,
        role: "USER",
        avatar: `https://ui-avatars.io/api/?name=Usuario&background=666&color=fff`,
        rating: 0,
        isActive: false,
      };
      setUser(fallbackUser);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateUser = useCallback(async (): Promise<boolean> => {
    // Not implemented for this specific hook
    return false;
  }, []);

  const refetch = useCallback(async () => {
    // Clear cache for this user and refetch
    userCache.delete(userId);
    await fetchUser();
  }, [userId, fetchUser]);

  const clearError = useCallback(() => setError(null), []);

  return {
    user,
    loading,
    error,
    refetch,
    updateUser,
    clearError,
  };
};

// Helper hook for just getting the user name
interface UseUserNameReturn {
  userName: string;
  loading: boolean;
  error: string | null;
}

export const useUserName = (userId: string): UseUserNameReturn => {
  const { user, loading, error } = useUserById(userId);

  const userName = user?.name || `Usuario ${userId.substring(0, 8)}`;

  return {
    userName,
    loading,
    error,
  };
};

// Hook for getting multiple users at once
interface UseUsersMapReturn {
  users: Map<string, UserDisplay>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUsersMap = (userIds: string[]): UseUsersMapReturn => {
  const [users, setUsers] = useState<Map<string, UserDisplay>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!userIds.length) {
      setUsers(new Map());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const usersMap = new Map<string, UserDisplay>();
      const idsToFetch: string[] = [];

      // Check cache first
      userIds.forEach(id => {
        if (userCache.has(id)) {
          usersMap.set(id, userCache.get(id)!);
        } else {
          idsToFetch.push(id);
        }
      });

      // Fetch missing users
      const fetchPromises = idsToFetch.map(async (userId) => {
        try {
          const data = await client.request(GET_USER_BY_ID, { id: userId }) as GetUserByIdResponse;
          if (data.getUserById) {
            const userDisplay: UserDisplay = {
              ...data.getUserById,
              avatar: `https://ui-avatars.io/api/?name=${encodeURIComponent(
                data.getUserById.name
              )}&background=1976d2&color=fff`,
              rating: 4.5,
              isActive: true,
            };
            userCache.set(userId, userDisplay);
            usersMap.set(userId, userDisplay);
          }
        } catch (err) {
          console.error(`Error fetching user ${userId}:`, err);
          // Add fallback user
          const fallbackUser: UserDisplay = {
            id: userId,
            email: "",
            name: `Usuario ${userId.substring(0, 8)}`,
            role: "USER",
            avatar: `https://ui-avatars.io/api/?name=Usuario&background=666&color=fff`,
            rating: 0,
            isActive: false,
          };
          usersMap.set(userId, fallbackUser);
        }
      });

      await Promise.all(fetchPromises);
      setUsers(usersMap);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "Error al obtener usuarios");
    } finally {
      setLoading(false);
    }
  }, [userIds]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refetch = useCallback(async () => {
    // Clear cache for these users and refetch
    userIds.forEach(id => userCache.delete(id));
    await fetchUsers();
  }, [userIds, fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch,
  };
};

// Utility function to get user display name
export const getUserDisplayName = (user: UserDisplay | null): string => {
  if (!user) return "Usuario desconocido";
  return user.name || `Usuario ${user.id.substring(0, 8)}`;
};

// Utility function to clear user cache (useful for logout)
export const clearUserCache = () => {
  userCache.clear();
};
