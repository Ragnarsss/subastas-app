import { useState, useEffect, useCallback } from "react";
import { gql } from "graphql-request";
import { client } from "../graphqlClient";

// Function to get category image based on the first category
const getCategoryImage = (categories: string[]): string => {
  if (!categories || categories.length === 0) {
    return "/src/images/default.jpeg"; // fallback image
  }

  const category = categories[0].toLowerCase();

  // Map categories to available images
  const categoryImageMap: { [key: string]: string } = {
    // Tecnología
    "tecnología": "/src/images/tecnologia.jpg",
    "tecnologia": "/src/images/tecnologia.jpg",
    "casa": "/src/images/casa.jpeg",
    "deportes": "/src/images/deporte.jpeg",
    "deporte": "/src/images/deporte.jpeg",
    "herramienta": "/src/images/herramienta.jpeg",
    "herramientas": "/src/images/herramienta.jpeg",
    "arte": "/src/images/arte.jpeg",
    "vehículo": "/src/images/vehiculos.jpeg",
    "vehiculo": "/src/images/vehiculos.jpeg",
    "auto": "/src/images/auto.jpeg",
    "automoviles": "/src/images/auto.jpeg",
    "autos": "/src/images/auto.jpeg",   
    "motocicleta": "/src/images/moto.jpeg",
    "coleccionable": "/src/images/coleccion.jpeg",
    "departamento": "/src/images/depto.jpeg",
    "música": "/src/images/musica.jpeg",
    "musica": "/src/images/musica.jpeg",
    "electrónica": "/src/images/electro.jpeg",
    "libro": "/src/images/libro.jpeg",
  };

  return categoryImageMap[category] || "/src/images/default.jpeg"; // default to tecnologia if not found
};

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
    createItem(input: $input)
  }
`;

const UPDATE_HIGHEST_BID_MUTATION = gql`
  mutation UpdateHighestBid($itemId: String!, $currentHighestBid: Float!, $highestBidderId: String) {
    updateHighestBid(itemId: $itemId, currentHighestBid: $currentHighestBid, highestBidderId: $highestBidderId) {
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

const GET_ITEM_BY_ID_QUERY = gql`
  query GetItemById($id: String!) {
    getItemById(id: $id) {
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
  updateHighestBid: (
    itemId: string,
    currentHighestBid: number,
    highestBidderId?: string
  ) => Promise<{ success: boolean; error?: string; item?: ItemDisplay }>;
  clearError: () => void;
}

interface UseUserItemsReturn extends UseItemsReturn {
  availableItems: ItemDisplay[];
  auctionedItems: ItemDisplay[];
}

interface UseItemByIdReturn {
  item: ItemDisplay | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateHighestBid: (
    currentHighestBid: number,
    highestBidderId?: string
  ) => Promise<{ success: boolean; error?: string; item?: ItemDisplay }>;
  clearError: () => void;
}

// Helper function to determine item status
const getItemStatus = (item: Item): "available" | "auctioned" | "sold" | "expired" => {
  const now = new Date();
  const endDate = new Date(item.endDate);
  
  if (endDate < now) {
    return "expired";
  }
  
  if (item.isAuctioned) {
    return "auctioned";
  }
  
  return "available";
};

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
      console.log("Fetched items:", (data as any).getItems);

      // Transform GraphQL response to display format
      const itemsDisplay: ItemDisplay[] = (data as any).getItems.map((item: Item) => ({
        ...item,
        image: getCategoryImage(item.categories),
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
          image: getCategoryImage(["Electrónicos", "Smartphones"]),
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
          image: getCategoryImage(["Electrónicos", "Computadores"]),
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
          isAuctioned: itemData.isAuctioned || false, // Default to not auctioned
        };

        console.log("Creating item with input:", input);
        const data = await client.request(CREATE_ITEM_MUTATION, { input });
        console.log("Create item response:", data);

        // Since createItem returns just the ID string, we need to construct the item
        const itemId = (data as any).createItem;

        const newItem: ItemDisplay = {
          _id: itemId,
          ...itemData,
          userId,
          isAuctioned: itemData.isAuctioned || false,
          image: getCategoryImage(itemData.categories || []),
          views: 0,
          status: itemData.isAuctioned ? "auctioned" : "available",
        };

        // Add the new item to the list
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

  const updateHighestBid = useCallback(
    async (
      itemId: string,
      currentHighestBid: number,
      highestBidderId?: string
    ): Promise<{ success: boolean; error?: string; item?: ItemDisplay }> => {
      try {
        setError(null);

        console.log("Updating highest bid with params:", {
          itemId,
          currentHighestBid,
          highestBidderId,
        });

        const data = await client.request(UPDATE_HIGHEST_BID_MUTATION, {
          itemId,
          currentHighestBid,
          highestBidderId,
        });

        console.log("Update highest bid response:", data);

        const updatedItem = (data as any).updateHighestBid;

        // Update the item in the local state
        setItems((prev) =>
          prev.map((item) =>
            item._id === itemId
              ? {
                  ...item,
                  currentHighestBid: updatedItem.currentHighestBid,
                  highestBidderId: updatedItem.highestBidderId,
                }
              : item
          )
        );

        const updatedItemDisplay: ItemDisplay = {
          ...updatedItem,
          image: getCategoryImage(updatedItem.categories || []),
          views: 0, // We don't have views in the GraphQL response
          status: getItemStatus(updatedItem),
        };

        return { success: true, item: updatedItemDisplay };
      } catch (err: any) {
        const errorMessage =
          err.response?.errors?.[0]?.message ||
          err.message ||
          "Error updating highest bid";
        setError(errorMessage);
        console.error("Error updating highest bid:", err);
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
    updateHighestBid,
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
      const itemsDisplay: ItemDisplay[] = (data as any).getItemsByUser.map(
        (item: Item) => ({
          ...item,
          image: getCategoryImage(item.categories),
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
          image: getCategoryImage(["Electrónicos", "Smartphones"]),
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
          isAuctioned: itemData.isAuctioned || false,
        };

        console.log("Creating user item with input:", input);
        const data = await client.request(CREATE_ITEM_MUTATION, { input });
        console.log("Create user item response:", data);

        // Since createItem returns just the ID string, we need to construct the item
        const itemId = (data as any).createItem;

        const newItem: ItemDisplay = {
          _id: itemId,
          ...itemData,
          userId,
          isAuctioned: itemData.isAuctioned || false,
          image: getCategoryImage(itemData.categories || []),
          views: 0,
          status: itemData.isAuctioned ? "auctioned" : "available",
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

  const updateHighestBid = useCallback(
    async (
      itemId: string,
      currentHighestBid: number,
      highestBidderId?: string
    ): Promise<{ success: boolean; error?: string; item?: ItemDisplay }> => {
      try {
        setError(null);

        console.log("Updating highest bid for user items with params:", {
          itemId,
          currentHighestBid,
          highestBidderId,
        });

        const data = await client.request(UPDATE_HIGHEST_BID_MUTATION, {
          itemId,
          currentHighestBid,
          highestBidderId,
        });

        console.log("Update highest bid response (user items):", data);

        const updatedItem = (data as any).updateHighestBid;

        // Update the item in the local state
        setItems((prev) =>
          prev.map((item) =>
            item._id === itemId
              ? {
                  ...item,
                  currentHighestBid: updatedItem.currentHighestBid,
                  highestBidderId: updatedItem.highestBidderId,
                }
              : item
          )
        );

        const updatedItemDisplay: ItemDisplay = {
          ...updatedItem,
          image: getCategoryImage(updatedItem.categories || []),
          views: 0, // We don't have views in the GraphQL response
          status: getItemStatus(updatedItem),
        };

        return { success: true, item: updatedItemDisplay };
      } catch (err: any) {
        const errorMessage =
          err.response?.errors?.[0]?.message ||
          err.message ||
          "Error updating highest bid";
        setError(errorMessage);
        console.error("Error updating highest bid:", err);
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
    updateHighestBid,
    clearError,
  };
};

// Hook for getting items by current user
export const useUserItems = (): UseUserItemsReturn => {
  const userId = localStorage.getItem("userId");
  const { items, loading, error, refetch, createItem, updateHighestBid, clearError } =
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
    updateHighestBid,
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

// Hook for getting a specific item by ID
export const useItemById = (itemId: string): UseItemByIdReturn => {
  const [item, setItem] = useState<ItemDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = useCallback(async () => {
    if (!itemId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Fetching item by ID:", itemId);
      const data = await client.request(GET_ITEM_BY_ID_QUERY, { id: itemId });
      console.log("Fetched item data:", data);

      const itemData = (data as any).getItemById;
      
      if (!itemData) {
        setError("Item no encontrado");
        setItem(null);
        return;
      }

      // Transform to display format
      const itemDisplay: ItemDisplay = {
        ...itemData,
        image: getCategoryImage(itemData.categories),
        views: Math.floor(Math.random() * 500) + 50, // Mock views
        status: getItemStatus(itemData),
      };

      setItem(itemDisplay);
    } catch (err: any) {
      const errorMessage =
        err.response?.errors?.[0]?.message ||
        err.message ||
        "Error fetching item";
      setError(errorMessage);
      console.error("Error fetching item:", err);

      // Mock data for development when GraphQL fails
      const mockItem: ItemDisplay = {
        _id: itemId,
        name: "PlayStation 5 (Item Mock)",
        userId: "user_123",
        initialPrice: 800000,
        currentHighestBid: 950000,
        highestBidderId: "user_456",
        description: "Consola PlayStation 5 en perfectas condiciones. Incluye control DualSense y todos los cables originales.",
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        isAuctioned: true,
        categories: ["Tecnología", "Gaming"],
        image: getCategoryImage(["Tecnología"]),
        views: 234,
        status: "auctioned",
      };

      setItem(mockItem);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  const refetch = useCallback(() => fetchItem(), [fetchItem]);
  const clearError = useCallback(() => setError(null), []);

  const updateHighestBid = useCallback(
    async (
      currentHighestBid: number,
      highestBidderId?: string
    ): Promise<{ success: boolean; error?: string; item?: ItemDisplay }> => {
      if (!itemId) {
        return { success: false, error: "No item ID provided" };
      }

      try {
        setError(null);

        console.log("Updating highest bid for item by ID with params:", {
          itemId,
          currentHighestBid,
          highestBidderId,
        });

        const data = await client.request(UPDATE_HIGHEST_BID_MUTATION, {
          itemId,
          currentHighestBid,
          highestBidderId,
        });

        console.log("Update highest bid response (item by ID):", data);

        const updatedItem = (data as any).updateHighestBid;

        const updatedItemDisplay: ItemDisplay = {
          ...updatedItem,
          image: getCategoryImage(updatedItem.categories || []),
          views: item?.views || 0, // Preserve existing views or default to 0
          status: getItemStatus(updatedItem),
        };

        // Update the local item state
        setItem(updatedItemDisplay);

        return { success: true, item: updatedItemDisplay };
      } catch (err: any) {
        const errorMessage =
          err.response?.errors?.[0]?.message ||
          err.message ||
          "Error updating highest bid";
        setError(errorMessage);
        console.error("Error updating highest bid:", err);
        return { success: false, error: errorMessage };
      }
    },
    [itemId, item?.views]
  );

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return {
    item,
    loading,
    error,
    refetch,
    updateHighestBid,
    clearError,
  };
};

// Hook specifically for creating auction items
export const useCreateAuctionItem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAuctionItem = useCallback(
    async (itemData: {
      name: string;
      initialPrice: number;
      description: string;
      endDate: string;
      categories: string[];
    }): Promise<{ success: boolean; error?: string; itemId?: string }> => {
      try {
        setLoading(true);
        setError(null);

        const userId = localStorage.getItem("userId");
        if (!userId) {
          throw new Error("Usuario no autenticado");
        }

        const input: CreateItemInput = {
          ...itemData,
          userId,
          isAuctioned: true, // Always true for auction items
        };

        console.log("Creating auction item with input:", input);
        const data = await client.request(CREATE_ITEM_MUTATION, { input });
        console.log("Create auction item response:", data);

        const itemId = (data as any).createItem;
        
        return { success: true, itemId };
      } catch (err: any) {
        const errorMessage =
          err.response?.errors?.[0]?.message ||
          err.message ||
          "Error creating auction item";
        setError(errorMessage);
        console.error("Error creating auction item:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    createAuctionItem,
    loading,
    error,
    clearError,
  };
};

// Example usage function for the GraphQL mutation you provided
export const createExampleAuctionItem = async () => {
  const { createAuctionItem } = useCreateAuctionItem();
  
  return await createAuctionItem({
    name: "play 4",
    initialPrice: 220000.0,
    description: "PS4 en perfecto estado",
    endDate: "2025-06-01T12:00:00Z",
    categories: ["Gaming", "Consolas"], // Adding categories as they're required
  });
};
