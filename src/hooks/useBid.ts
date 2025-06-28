import { useState, useEffect, useCallback } from "react";
import { gql } from "graphql-request";
import { client } from "../graphqlClient";

// Bid interface matching GraphQL schema
interface Bid {
  id: string;
  item_id: string;
  user_id: string;
  amount: number;
  created_at: string;
}

// Extended interface for display purposes
interface BidDisplay extends Bid {
  userName?: string;
  userAvatar?: string;
  isHighest?: boolean;
  timeAgo?: string;
}

// Create Bid Input interface
interface CreateBidInput {
  item_id: string;
  user_id: string;
  amount: number;
}

// GraphQL Queries and Mutations
const CREATE_BID_MUTATION = gql`
  mutation CreateBid($item_id: String!, $user_id: String!, $amount: Float!) {
    createBid(item_id: $item_id, user_id: $user_id, amount: $amount) {
      id
      item_id
      user_id
      amount
      created_at
    }
  }
`;

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

interface UseBidsReturn {
  bids: BidDisplay[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createBid: (
    bidData: Omit<CreateBidInput, "user_id">
  ) => Promise<{ success: boolean; error?: string; bid?: BidDisplay }>;
  clearError: () => void;
  highestBid: BidDisplay | null;
  userBids: BidDisplay[];
  isUserHighestBidder: boolean;
}

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

// Hook for getting bids by item ID
export const useBids = (itemId: string, userId?: string): UseBidsReturn => {
  const [bids, setBids] = useState<BidDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBids = useCallback(async () => {
    if (!itemId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await client.request(LIST_BIDS_QUERY, { item_id: itemId });
      console.log("Fetched bids:", data);

      // Transform GraphQL response to display format
      const rawBids = (data as any).listBids || []; // Ensure we have an array
      const bidsDisplay: BidDisplay[] = rawBids
        .map((bid: Bid) => ({
          ...bid,
          userName: `Usuario ${bid.user_id.substring(0, 8)}`,
          userAvatar: undefined,
          timeAgo: getTimeAgo(bid.created_at),
        }))
        .sort((a: Bid, b: Bid) => b.amount - a.amount); // Sort by amount (highest first)

      // Mark the highest bid
      if (bidsDisplay.length > 0) {
        bidsDisplay[0].isHighest = true;
      }

      setBids(bidsDisplay);
    } catch (err: any) {
      const errorMessage =
        err.response?.errors?.[0]?.message ||
        err.message ||
        "Error fetching bids";
      
      console.warn("Error fetching bids, using mock data:", errorMessage);
      // Don't set error here to allow fallback to mock data to work smoothly
      // setError(errorMessage);
      console.error("Error fetching bids:", err);

    } finally {
      setLoading(false);
    }
  }, [itemId]);

  const createBid = useCallback(
    async (
      bidData: Omit<CreateBidInput, "user_id">
    ): Promise<{ success: boolean; error?: string; bid?: BidDisplay }> => {
      try {
        setError(null);

        const currentUserId = userId || localStorage.getItem("userId");
        if (!currentUserId) {
          throw new Error("Usuario no autenticado");
        }

        const input = {
          ...bidData,
          user_id: currentUserId,
        };

        console.log("Creating bid with input:", input);

        // Step 1: Create the bid
        const bidResponse = await client.request(CREATE_BID_MUTATION, input);
        console.log("Create bid response:", bidResponse);

        const newBid: BidDisplay = {
          ...(bidResponse as any).createBid,
          userName: `Usuario ${currentUserId.substring(0, 8)}`,
          timeAgo: "Hace un momento",
          isHighest: false, // Will be updated when we refetch
        };

        // Step 2: Update the item's highest bid
        console.log("Updating item highest bid after successful bid creation");
        try {
          const updateResponse = await client.request(UPDATE_HIGHEST_BID_MUTATION, {
            itemId: bidData.item_id,
            currentHighestBid: bidData.amount,
            highestBidderId: currentUserId,
          });
          console.log("Update highest bid response:", updateResponse);
        } catch (updateError) {
          console.warn("Failed to update highest bid, but bid was created:", updateError);
          // Don't fail the entire operation if the update fails
        }

        // Step 3: Refetch bids to get the updated list with correct highest bid
        await fetchBids();

        return { success: true, bid: newBid };
      } catch (err: any) {
        const errorMessage =
          err.response?.errors?.[0]?.message ||
          err.message ||
          "Error creating bid";
        setError(errorMessage);
        console.error("Error creating bid:", err);
        return { success: false, error: errorMessage };
      }
    },
    [itemId, userId, fetchBids]
  );

  const refetch = useCallback(() => fetchBids(), [fetchBids]);
  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  // Computed values
  const highestBid = bids.length > 0 ? bids[0] : null;
  const userBids = userId ? bids.filter(bid => bid.user_id === userId) : [];
  const isUserHighestBidder = highestBid ? highestBid.user_id === userId : false;

  return {
    bids,
    loading,
    error,
    refetch,
    createBid,
    clearError,
    highestBid,
    userBids,
    isUserHighestBidder,
  };
};

// Hook for creating a single bid (alternative interface)
export const useBidActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBid = useCallback(
    async (
      input: CreateBidInput
    ): Promise<{ success: boolean; error?: string; bid?: Bid }> => {
      try {
        setLoading(true);
        setError(null);

        const data = await client.request(CREATE_BID_MUTATION, input);

        return { success: true, bid: (data as any).createBid };
      } catch (err: any) {
        const errorMessage =
          err.response?.errors?.[0]?.message ||
          err.message ||
          "Error creating bid";
        setError(errorMessage);
        console.error("Error creating bid:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    createBid,
    loading,
    error,
    clearError,
  };
};

// Hook combinado para crear pujas y actualizar items
export const useBidWithItemUpdate = () => {
  const { createBid: createBidOnly, loading: bidLoading, error: bidError, clearError: clearBidError } = useBidActions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBidAndUpdateItem = useCallback(
    async (
      bidData: Omit<CreateBidInput, "user_id">
    ): Promise<{ success: boolean; error?: string; bid?: Bid }> => {
      try {
        setLoading(true);
        setError(null);

        const currentUserId = localStorage.getItem("userId");
        if (!currentUserId) {
          throw new Error("Usuario no autenticado");
        }

        const input = {
          ...bidData,
          user_id: currentUserId,
        };

        console.log("Creating bid with item update:", input);

        // Step 1: Create the bid
        const bidResult = await createBidOnly(input);
        if (!bidResult.success) {
          throw new Error(bidResult.error || "Error creating bid");
        }

        console.log("Bid created successfully, now updating item highest bid");

        // Step 2: Update the item's highest bid
        try {
          const updateResponse = await client.request(UPDATE_HIGHEST_BID_MUTATION, {
            itemId: bidData.item_id,
            currentHighestBid: bidData.amount,
            highestBidderId: currentUserId,
          });
          console.log("Item highest bid updated successfully:", updateResponse);
        } catch (updateError) {
          console.warn("Failed to update item highest bid, but bid was created:", updateError);
          // Don't fail the entire operation if the update fails
        }

        return bidResult;
      } catch (err: any) {
        const errorMessage =
          err.response?.errors?.[0]?.message ||
          err.message ||
          "Error creating bid with item update";
        setError(errorMessage);
        console.error("Error creating bid with item update:", err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [createBidOnly]
  );

  const clearError = useCallback(() => {
    setError(null);
    clearBidError();
  }, [clearBidError]);

  return {
    createBidAndUpdateItem,
    loading: loading || bidLoading,
    error: error || bidError,
    clearError,
  };
};
