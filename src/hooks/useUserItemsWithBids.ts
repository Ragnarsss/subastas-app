import { useState, useEffect, useCallback } from "react";
import { gql } from "graphql-request";
import { client } from "../graphqlClient";

// Interface for item with bid information
interface ItemWithBids {
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
  image?: string;
  views?: number;
  status: "available" | "auctioned" | "sold" | "expired";
  // Bid information
  totalBids: number;
  bids: BidInfo[];
  latestBid?: BidInfo;
  hasActiveBids: boolean;
}

interface BidInfo {
  id: string;
  amount: number;
  user_id: string;
  created_at: string;
  userName?: string;
  timeAgo?: string;
}

// GraphQL query to get bids for items
const LIST_BIDS_QUERY = gql`
  query ListBids($item_id: String!) {
    listBids(item_id: $item_id) {
      id
      item_id
      user_id
      amount
      created_at
    }
  }
`;

// Helper function to get category image
const getCategoryImage = (categories: string[]): string => {
  if (!categories || categories.length === 0) {
    return "/src/images/default.jpeg";
  }

  const category = categories[0].toLowerCase();
  const categoryImageMap: { [key: string]: string } = {
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

  return categoryImageMap[category] || "/src/images/default.jpeg";
};

// Helper function to determine item status
const getItemStatus = (item: any): "available" | "auctioned" | "sold" | "expired" => {
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

// Helper function to format time ago
const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return "Hace un momento";
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Hace ${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `Hace ${diffInDays}d`;
};

interface UseUserItemsWithBidsReturn {
  items: ItemWithBids[];
  availableItems: ItemWithBids[];
  auctionedItems: ItemWithBids[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useUserItemsWithBids = (): UseUserItemsWithBidsReturn => {
  const [items, setItems] = useState<ItemWithBids[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItemsWithBids = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("Usuario no autenticado");
      }

      // First, get user's items
      const itemsData = await client.request(gql`
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
      `, { userId });

      const userItems = (itemsData as any).getItemsByUser || [];
      console.log("User items:", userItems);

      // For each item, get its bids
      const itemsWithBids: ItemWithBids[] = await Promise.all(
        userItems.map(async (item: any) => {
          try {
            const bidsData = await client.request(LIST_BIDS_QUERY, { item_id: item._id });
            const bids: BidInfo[] = ((bidsData as any).listBids || []).map((bid: any) => ({
              ...bid,
              userName: `Usuario ${bid.user_id.substring(0, 8)}`,
              timeAgo: getTimeAgo(bid.created_at),
            }));

            // Sort bids by amount (highest first)
            bids.sort((a, b) => b.amount - a.amount);

            const itemWithBids: ItemWithBids = {
              ...item,
              image: getCategoryImage(item.categories),
              views: Math.floor(Math.random() * 200) + 10, // Mock views for now
              status: getItemStatus(item),
              totalBids: bids.length,
              bids,
              latestBid: bids.length > 0 ? bids[0] : undefined,
              hasActiveBids: bids.length > 0,
            };

            return itemWithBids;
          } catch (bidError) {
            console.warn(`Error fetching bids for item ${item._id}:`, bidError);
            // Return item without bid data if bids fail to load
            return {
              ...item,
              image: getCategoryImage(item.categories),
              views: Math.floor(Math.random() * 200) + 10,
              status: getItemStatus(item),
              totalBids: 0,
              bids: [],
              hasActiveBids: false,
            };
          }
        })
      );

      setItems(itemsWithBids);
    } catch (err: any) {
      const errorMessage = 
        err.response?.errors?.[0]?.message ||
        err.message ||
        "Error fetching items with bids";
      setError(errorMessage);
      console.error("Error fetching items with bids:", err);

      // Fallback to mock data for development
      const mockItems: ItemWithBids[] = [
        {
          _id: "item_1",
          name: "MacBook Pro M2",
          userId: localStorage.getItem("userId") || "",
          initialPrice: 1200000,
          currentHighestBid: 1350000,
          highestBidderId: "user_123",
          description: "MacBook Pro con chip M2, perfecto estado",
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          isAuctioned: true,
          categories: ["Tecnología", "Computadores"],
          image: getCategoryImage(["Tecnología"]),
          views: 145,
          status: "auctioned",
          totalBids: 8,
          bids: [
            {
              id: "bid_1",
              amount: 1350000,
              user_id: "user_123",
              created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              userName: "Usuario user_123",
              timeAgo: "Hace 30 min"
            },
            {
              id: "bid_2",
              amount: 1300000,
              user_id: "user_456",
              created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              userName: "Usuario user_456",
              timeAgo: "Hace 2h"
            }
          ],
          latestBid: {
            id: "bid_1",
            amount: 1350000,
            user_id: "user_123",
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            userName: "Usuario user_123",
            timeAgo: "Hace 30 min"
          },
          hasActiveBids: true,
        },
        {
          _id: "item_2",
          name: "iPhone 15 Pro",
          userId: localStorage.getItem("userId") || "",
          initialPrice: 800000,
          description: "iPhone 15 Pro en excelente estado",
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          isAuctioned: false,
          categories: ["Tecnología", "Smartphones"],
          image: getCategoryImage(["Tecnología"]),
          views: 87,
          status: "available",
          totalBids: 0,
          bids: [],
          hasActiveBids: false,
        }
      ];

      setItems(mockItems);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => fetchItemsWithBids(), [fetchItemsWithBids]);
  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    fetchItemsWithBids();
  }, [fetchItemsWithBids]);

  // Computed values
  const availableItems = items.filter((item) => !item.isAuctioned);
  const auctionedItems = items.filter((item) => item.isAuctioned);

  return {
    items,
    availableItems,
    auctionedItems,
    loading,
    error,
    refetch,
    clearError,
  };
};
