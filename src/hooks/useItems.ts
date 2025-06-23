import { useState, useEffect, useCallback } from "react";
import { gql } from "graphql-request";
import { client } from "../graphqlClient";

// Item interface matching GraphQL schema
interface Item {
  _id: string;
  name: string;
  userId: string;
  initialPrice: number;
  currentHighestBid?: number;
  highestBidderId?: string;
  description: string;
  endDate: string;
  isAuctioned: boolean;
  categories: string[];
}

// Extended interface for display purposes
interface ItemDisplay extends Item {
  image?: string;
  views?: number;
  status: "available" | "auctioned" | "sold" | "expired";
}

// Create Item Input interface
interface CreateItemInput {
  name: string;
  userId: string;
  initialPrice: number;
  currentHighestBid?: number;
  highestBidderId?: string;
  description: string;
  endDate: string;
  isAuctioned?: boolean;
  categories: string[];
}

// GraphQL Queries and Mutations
const GET_ITEMS_QUERY = gql`
  query GetItems {
    getItems {
      _id
      name
      userId
      initialPrice
      currentHighestBid
      highestBidderId
      description
      endDate
      isAuctioned
      categories
    }
  }
`;

const GET_ITEMS_BY_USER_QUERY = gql`
  query GetItemsByUser($userId: String!) {
    getItemsByUser(userId: $userId) {
      _id
      name
      userId
      initialPrice
      currentHighestBid
      highestBidderId
      description
      endDate
      isAuctioned
      categories
    }
  }
`;

const CREATE_ITEM_MUTATION = gql`
  mutation CreateItem($input: CreateItemInput!) {
    createItem(input: $input) {
      _id
      name
      userId
      initialPrice
      currentHighestBid
      highestBidderId
      description
      endDate
      isAuctioned
      categories
    }
  }
`;

interface UseItemsReturn {
  items: ItemDisplay[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createItem: (
    itemData: Omit<CreateItemInput, "userId">
  ) => Promise<{ success: boolean; error?: string; item?: ItemDisplay }>;
  clearError: () => void;
}

interface UseUserItemsReturn extends UseItemsReturn {
  availableItems: ItemDisplay[];
  auctionedItems: ItemDisplay[];
}

// Hook for getting all items
export const useItems = (): UseItemsReturn => {
  const [items, setItems] = useState<ItemDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await client.request(GET_ITEMS_QUERY);

      // Transform GraphQL response to display format
      const itemsDisplay: ItemDisplay[] = data.getItems.map((item: Item) => ({
        ...item,
        image: `https://picsum.photos/300/200?random=${item._id}`, // placeholder
        views: Math.floor(Math.random() * 100), // placeholder
        status: item.isAuctioned ? "auctioned" : ("available" as const),
      }));

      setItems(itemsDisplay);
    } catch (err: any) {
      const errorMessage =
        err.response?.errors?.[0]?.message ||
        err.message ||
        "Error fetching items";
      setError(errorMessage);
      console.error("Error fetching items:", err);

      // Mock data for development
      const mockItems: ItemDisplay[] = [
        {
          _id: "item_1",
          name: "iPhone 15 Pro Max",
          userId: localStorage.getItem("userId") || "user_1",
          initialPrice: 800000,
          currentHighestBid: 950000,
          description: "iPhone 15 Pro Max 256GB en excelente estado",
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          isAuctioned: true,
          categories: ["Electrónicos", "Smartphones"],
          image: "https://picsum.photos/300/200?random=1",
          views: 156,
          status: "auctioned",
        },
        {
          _id: "item_2",
          name: "MacBook Air M2",
          userId: localStorage.getItem("userId") || "user_1",
          initialPrice: 700000,
          description: "MacBook Air con chip M2, 8GB RAM, 256GB SSD",
          endDate: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000
          ).toISOString(),
          isAuctioned: false,
          categories: ["Electrónicos", "Computadores"],
          image: "https://picsum.photos/300/200?random=2",
          views: 89,
          status: "available",
        },
      ];
      setItems(mockItems);
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(
    async (
      itemData: Omit<CreateItemInput, "userId">
    ): Promise<{ success: boolean; error?: string; item?: ItemDisplay }> => {
      try {
        setError(null);

        const userId = localStorage.getItem("userId");
        if (!userId) {
          throw new Error("Usuario no autenticado");
        }

        const input: CreateItemInput = {
          ...itemData,
          userId,
          isAuctioned: false, // Default to not auctioned
        };

        const data = await client.request(CREATE_ITEM_MUTATION, { input });

        const newItem: ItemDisplay = {
          ...data.createItem,
          image: `https://picsum.photos/300/200?random=${data.createItem._id}`,
          views: 0,
          status: "available",
        };

        setItems((prev) => [newItem, ...prev]);

        return { success: true, item: newItem };
      } catch (err: any) {
        const errorMessage =
          err.response?.errors?.[0]?.message ||
          err.message ||
          "Error creating item";
        setError(errorMessage);
        console.error("Error creating item:", err);
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  const refetch = useCallback(() => fetchItems(), [fetchItems]);
  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    refetch,
    createItem,
    clearError,
  };
};

// Hook for getting items by specific user ID
export const useItemsByUser = (userId: string): UseItemsReturn => {
  const [items, setItems] = useState<ItemDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await client.request(GET_ITEMS_BY_USER_QUERY, { userId });

      // Transform GraphQL response to display format
      const itemsDisplay: ItemDisplay[] = data.getItemsByUser.map(
        (item: Item) => ({
          ...item,
          image: `https://picsum.photos/300/200?random=${item._id}`,
          views: Math.floor(Math.random() * 100),
          status: item.isAuctioned ? "auctioned" : ("available" as const),
        })
      );

      setItems(itemsDisplay);
    } catch (err: any) {
      const errorMessage =
        err.response?.errors?.[0]?.message ||
        err.message ||
        "Error fetching user items";
      setError(errorMessage);
      console.error("Error fetching user items:", err);

      // Mock data for development
      const mockItems: ItemDisplay[] = [
        {
          _id: "user_item_1",
          name: "Samsung Galaxy S24",
          userId: userId,
          initialPrice: 600000,
          description: "Samsung Galaxy S24 Ultra 512GB",
          endDate: new Date(
            Date.now() + 10 * 24 * 60 * 60 * 1000
          ).toISOString(),
          isAuctioned: false,
          categories: ["Electrónicos", "Smartphones"],
          image: "https://picsum.photos/300/200?random=3",
          views: 42,
          status: "available",
        },
      ];
      setItems(mockItems);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createItem = useCallback(
    async (
      itemData: Omit<CreateItemInput, "userId">
    ): Promise<{ success: boolean; error?: string; item?: ItemDisplay }> => {
      try {
        setError(null);

        if (!userId) {
          throw new Error("Usuario no autenticado");
        }

        const input: CreateItemInput = {
          ...itemData,
          userId,
          isAuctioned: false,
        };

        const data = await client.request(CREATE_ITEM_MUTATION, { input });

        const newItem: ItemDisplay = {
          ...data.createItem,
          image: `https://picsum.photos/300/200?random=${data.createItem._id}`,
          views: 0,
          status: "available",
        };

        setItems((prev) => [newItem, ...prev]);

        return { success: true, item: newItem };
      } catch (err: any) {
        const errorMessage =
          err.response?.errors?.[0]?.message ||
          err.message ||
          "Error creating item";
        setError(errorMessage);
        console.error("Error creating item:", err);
        return { success: false, error: errorMessage };
      }
    },
    [userId]
  );

  const refetch = useCallback(() => fetchItems(), [fetchItems]);
  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    refetch,
    createItem,
    clearError,
  };
};

// Hook for getting items by current user
export const useUserItems = (): UseUserItemsReturn => {
  const userId = localStorage.getItem("userId");
  const { items, loading, error, refetch, createItem, clearError } =
    useItemsByUser(userId || "");

  const availableItems = items.filter((item) => !item.isAuctioned);
  const auctionedItems = items.filter((item) => item.isAuctioned);

  return {
    items,
    availableItems,
    auctionedItems,
    loading,
    error,
    refetch,
    createItem,
    clearError,
  };
};

// Hook for getting available items for auction creation
export const useAvailableItems = () => {
  const { availableItems, loading, error, refetch } = useUserItems();

  return {
    items: availableItems,
    loading,
    error,
    refetch,
  };
};
