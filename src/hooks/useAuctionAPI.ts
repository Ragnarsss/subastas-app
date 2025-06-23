import { useState } from "react";

// Input interfaces matching the controller DTOs
interface CreateAuctionInput {
  user_id: string;
  item_id: string;
  title: string;
  description: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  base_price: string;
  min_bid_increment: string;
  highest_bid: string;
  currency: string;
}

interface CreateBidInput {
  id: string;
  user_id: string;
  amount: string;
  created_at: string;
  status: string;
}

interface UpdateAuctionInput {
  title?: string;
  description?: string;
  end_time?: string;
  base_price?: string;
  min_bid_increment?: string;
  currency?: string;
}

interface CreateAuctionData {
  title: string;
  description: string;
  category: string;
  startingBid: number;
  duration: number;
  minBidIncrement?: number;
  currency?: string;
  itemId?: string; // Optional item ID for pre-selected items
}

// API Response structures matching the controller
interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
  loading: boolean;
}

// Helper function to transform API response to display format
const transformApiAuction = (apiAuction: any) => {
  return {
    ...apiAuction,
    // Add computed properties that the UI expects
    currentBid: parseFloat(
      apiAuction.highest_bid || apiAuction.base_price || "0"
    ),
    minBid: parseFloat(apiAuction.base_price || "0"),
    endDate: apiAuction.end_time,
    images: apiAuction.images || ["https://via.placeholder.com/300x200"],
    seller: {
      name: `Usuario ${(apiAuction.user_id || "").substring(0, 8)}`,
      rating: 4.5,
      avatar: undefined,
    },
    views: Math.floor(Math.random() * 200) + 50,
    category: apiAuction.category || "Sin categoría",
    bids: apiAuction.bids || [],
  };
};

export const useAuctionAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAuction = async (
    auctionData: CreateAuctionData
  ): Promise<APIResponse<any>> => {
    setLoading(true);
    setError(null);

    try {
      // Calculate start and end times
      const startTime = new Date();
      const endTime = new Date(
        startTime.getTime() + auctionData.duration * 24 * 60 * 60 * 1000
      );

      // Prepare auction request data according to controller structure
      const auctionRequest: CreateAuctionInput = {
        user_id: localStorage.getItem("userId") || "user_default",
        item_id: auctionData.itemId || `item_${Date.now()}`,
        title: auctionData.title,
        description: auctionData.description,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        base_price: auctionData.startingBid.toString(),
        min_bid_increment: (
          auctionData.minBidIncrement || auctionData.startingBid * 0.05
        ).toString(),
        highest_bid: auctionData.startingBid.toString(),
        currency: auctionData.currency || "CLP",
      };

      const response = await fetch("http://localhost:3001/auctions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(auctionRequest),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      // Check if the API response indicates success
      if (!apiResponse.success) {
        throw new Error(
          apiResponse.message || apiResponse.error || "Error creating auction"
        );
      }

      return {
        data: apiResponse.data,
        success: apiResponse.success,
        message: apiResponse.message,
        loading: false,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);

      return {
        error: errorMessage,
        success: false,
        loading: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const updateAuction = async (
    id: string,
    auctionData: Partial<CreateAuctionData>
  ): Promise<APIResponse<any>> => {
    setLoading(true);
    setError(null);

    try {
      const updateInput: UpdateAuctionInput = {};

      if (auctionData.title) updateInput.title = auctionData.title;
      if (auctionData.description)
        updateInput.description = auctionData.description;
      if (auctionData.startingBid)
        updateInput.base_price = auctionData.startingBid.toString();
      if (auctionData.minBidIncrement)
        updateInput.min_bid_increment = auctionData.minBidIncrement.toString();
      if (auctionData.currency) updateInput.currency = auctionData.currency;
      if (auctionData.duration) {
        const newEndTime = new Date(
          Date.now() + auctionData.duration * 24 * 60 * 60 * 1000
        );
        updateInput.end_time = newEndTime.toISOString();
      }

      const response = await fetch(`http://localhost:3001/auctions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(updateInput),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      if (!apiResponse.success) {
        throw new Error(
          apiResponse.message || apiResponse.error || "Error updating auction"
        );
      }

      return {
        data: apiResponse.data,
        success: apiResponse.success,
        message: apiResponse.message,
        loading: false,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);

      return {
        error: errorMessage,
        success: false,
        loading: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteAuction = async (id: string): Promise<APIResponse<boolean>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/auctions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      return {
        data: apiResponse.success,
        success: apiResponse.success,
        message: apiResponse.message,
        loading: false,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);

      return {
        error: errorMessage,
        success: false,
        loading: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const getAuction = async (id: string): Promise<APIResponse<any>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/auctions/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || "Auction not found");
      }

      return {
        data: apiResponse.data,
        success: apiResponse.success,
        loading: false,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);

      return {
        error: errorMessage,
        success: false,
        loading: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const listAuctions = async (): Promise<APIResponse<any[]>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/auctions", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      // Transform the data to match UI expectations
      const transformedData = Array.isArray(apiResponse.data)
        ? apiResponse.data.map(transformApiAuction)
        : [];

      return {
        data: transformedData,
        success: apiResponse.success,
        count: apiResponse.count,
        loading: false,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);

      return {
        error: errorMessage,
        success: false,
        data: [],
        loading: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const createBid = async (
    auctionId: string,
    bidData: {
      user_id: string;
      amount: string;
    }
  ): Promise<APIResponse<any>> => {
    setLoading(true);
    setError(null);

    try {
      const bidInput = {
        id: `bid_${Date.now()}`,
        user_id: bidData.user_id,
        amount: bidData.amount,
        created_at: new Date().toISOString(),
        status: "ACTIVE",
      };

      const response = await fetch(
        `http://localhost:3001/auctions/${auctionId}/bids`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(bidInput),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      if (!apiResponse.success) {
        throw new Error(
          apiResponse.message || apiResponse.error || "Error placing bid"
        );
      }

      return {
        data: apiResponse.data,
        success: apiResponse.success,
        message: apiResponse.message,
        loading: false,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);

      return {
        error: errorMessage,
        success: false,
        loading: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const listBids = async (auctionId: string): Promise<APIResponse<any[]>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:3001/auctions/${auctionId}/bids`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      return {
        data: apiResponse.data || [],
        success: apiResponse.success,
        count: apiResponse.count,
        loading: false,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);

      return {
        error: errorMessage,
        success: false,
        data: [],
        loading: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const getHighestBid = async (
    auctionId: string
  ): Promise<APIResponse<any>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:3001/auctions/${auctionId}/highest-bid`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      return {
        data: apiResponse.data,
        success: apiResponse.success,
        loading: false,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);

      return {
        error: errorMessage,
        success: false,
        loading: false,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    createAuction,
    updateAuction,
    deleteAuction,
    getAuction,
    listAuctions,
    createBid,
    listBids,
    getHighestBid,
    loading,
    error,
    clearError: () => setError(null),
  };
};
