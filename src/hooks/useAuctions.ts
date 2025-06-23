import { useState, useEffect, useCallback } from "react";

// gRPC Auction structure
interface Auction {
  id: string;
  user_id: string;
  item_id: string;
  title: string;
  description: string;
  start_time: string; // ISO string from protobuf Timestamp
  end_time: string; // ISO string from protobuf Timestamp
  base_price: string;
  min_bid_increment: string;
  highest_bid: string;
  status: string;
  currency: string;
  bids: Bid[];
  category: string;
}

// gRPC Bid structure
interface Bid {
  id: string;
  auction_id: string;
  user_id: string;
  amount: string;
  created_at: string; // ISO string from protobuf Timestamp
  status: string;
}

// Helper interface for display purposes
interface AuctionDisplay extends Auction {
  seller?: {
    name: string;
    rating: number;
    avatar?: string;
  };
  views?: number;
  currentBid: number; // computed from highest_bid
  minBid: number; // computed from base_price
  endDate: string; // alias for end_time
  images: string[]; // placeholder for images
}

// Backend response structure (updated to match actual API response)
interface BackendAuction {
  id: string;
  userId: string;
  itemId: string;
  title: string;
  description: string;
  startTime: {
    seconds: {
      low: number;
      high: number;
      unsigned: boolean;
    };
    nanos?: number;
  };
  endTime: {
    seconds: {
      low: number;
      high: number;
      unsigned: boolean;
    };
    nanos?: number;
  };
  basePrice: string;
  minBidIncrement: string;
  highestBid: string;
  status: string;
  currency: string;
  bids: BackendBid[];
  category?: string;
}

interface BackendBid {
  id: string;
  auctionId: string;
  userId: string;
  amount: string;
  createdAt: {
    seconds: {
      low: number;
      high: number;
      unsigned: boolean;
    };
    nanos?: number;
  };
  status: string;
}

interface BackendAuctionsResponse {
  success: boolean;
  data: BackendAuction[];
  count: number;
  message?: string;
}

interface AuctionsResponse {
  success: boolean;
  data: Auction[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseAuctionsParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  sortBy?: "endDate" | "currentBid" | "createdAt";
  sortOrder?: "asc" | "desc";
}

interface UseAuctionsReturn {
  auctions: Auction[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  refetch: () => Promise<void>;
  fetchMore: () => Promise<void>;
  hasMore: boolean;
  clearError: () => void;
}

// Helper function to convert protobuf timestamp to ISO string (updated for nanos)
const convertTimestampToISO = (timestamp: {
  seconds: { low: number; high: number; unsigned: boolean };
  nanos?: number;
}): string => {
  // Convert protobuf timestamp to milliseconds
  const seconds =
    timestamp.seconds.low + timestamp.seconds.high * Math.pow(2, 32);
  const milliseconds = timestamp.nanos ? timestamp.nanos / 1000000 : 0;
  return new Date(seconds * 1000 + milliseconds).toISOString();
};

// Helper function to transform backend data to display format
const transformBackendAuction = (
  backendAuction: BackendAuction
): AuctionDisplay => {
  const startTime = convertTimestampToISO(backendAuction.startTime);
  const endTime = convertTimestampToISO(backendAuction.endTime);

  return {
    id: backendAuction.id,
    user_id: backendAuction.userId,
    item_id: backendAuction.itemId,
    title: backendAuction.title,
    description: backendAuction.description,
    start_time: startTime,
    end_time: endTime,
    base_price: backendAuction.basePrice,
    min_bid_increment: backendAuction.minBidIncrement,
    highest_bid: backendAuction.highestBid,
    status: backendAuction.status,
    currency: backendAuction.currency,
    category: backendAuction.category || "Sin categoría",
    bids: backendAuction.bids.map((bid) => ({
      id: bid.id,
      auction_id: bid.auctionId,
      user_id: bid.userId,
      amount: bid.amount,
      created_at: convertTimestampToISO(bid.createdAt),
      status: bid.status,
    })),
    // Display helpers
    currentBid: parseFloat(
      backendAuction.highestBid || backendAuction.basePrice
    ),
    minBid: parseFloat(backendAuction.basePrice),
    endDate: endTime,
    images: ["https://via.placeholder.com/300x200"], // placeholder
    seller: {
      name: `Usuario ${backendAuction.userId.substring(0, 8)}`, // Use first 8 chars of userId
      rating: 4.5,
    },
    views: Math.floor(Math.random() * 200) + 50, // placeholder
  };
};

export const useAuctions = (
  params: UseAuctionsParams = {}
): UseAuctionsReturn => {
  const [auctions, setAuctions] = useState<AuctionDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] =
    useState<UseAuctionsReturn["pagination"]>(null);

  const {
    page = 1,
    limit = 10,
    category,
    status,
    sortBy = "endDate",
    sortOrder = "asc",
  } = params;

  const fetchAuctions = useCallback(
    async (isLoadMore = false) => {
      try {
        if (!isLoadMore) {
          setLoading(true);
        }
        setError(null);

        // Build query parameters
        const queryParams = new URLSearchParams({
          page: isLoadMore
            ? pagination?.page
              ? (pagination.page + 1).toString()
              : "1"
            : page.toString(),
          limit: limit.toString(),
          sortBy,
          sortOrder,
        });

        if (category) queryParams.append("category", category);
        if (status) queryParams.append("status", status);

        const response = await fetch(
          `http://localhost:3001/auctions?${queryParams.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const apiResponse: BackendAuctionsResponse = await response.json();

        if (!apiResponse.success) {
          throw new Error(apiResponse.message || "Error fetching auctions");
        }

        const transformedAuctions: AuctionDisplay[] = apiResponse.data.map(
          transformBackendAuction
        );

        if (isLoadMore) {
          setAuctions((prev) => [...prev, ...transformedAuctions]);
        } else {
          setAuctions(transformedAuctions);
        }

        const totalItems = apiResponse.count;
        setPagination({
          page: parseInt(queryParams.get("page") || "1"),
          limit: parseInt(queryParams.get("limit") || "10"),
          total: totalItems,
          totalPages: Math.ceil(totalItems / limit),
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error fetching auctions:", err);

        setAuctions([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [page, limit, category, status, sortBy, sortOrder, pagination?.page]
  );

  const refetch = useCallback(() => fetchAuctions(false), [fetchAuctions]);

  const fetchMore = useCallback(() => fetchAuctions(true), [fetchAuctions]);

  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    fetchAuctions();
  }, [page, limit, category, status, sortBy, sortOrder]);

  return {
    auctions,
    loading,
    error,
    pagination,
    refetch,
    fetchMore,
    hasMore,
    clearError,
  };
};

export const useAuction = (id: string) => {
  const [auction, setAuction] = useState<AuctionDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuction = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/auctions/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const apiResponse: {
        success: boolean;
        data: BackendAuction;
        message?: string;
      } = await response.json();

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || "Error fetching auction");
      }

      // Transform backend data to display format
      const transformedAuction = transformBackendAuction(apiResponse.data);

      // Add extra images for detail view
      transformedAuction.images = [
        "https://via.placeholder.com/600x400",
        "https://via.placeholder.com/600x400/0000FF",
        "https://via.placeholder.com/600x400/FF0000",
      ];

      setAuction(transformedAuction);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error fetching auction:", err);

      setAuction(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const refetch = useCallback(() => fetchAuction(), [fetchAuction]);

  useEffect(() => {
    if (id) {
      fetchAuction();
    }
  }, [id, fetchAuction]);

  return {
    auction,
    loading,
    error,
    refetch,
    clearError: () => setError(null),
  };
};
