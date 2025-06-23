import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  Box,
  Paper,
  Stack,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert,
  LinearProgress,
  Skeleton,
  Badge,
  IconButton,
  Fab,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Gavel as GavelIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MoneyIcon,
  EmojiEvents as TrophyIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
} from "@mui/icons-material";
import "./LiveBidding.css";
import { useAuction } from "../../hooks/useAuctions";
import { useSocketIO } from "../../hooks/useSocketIO";

interface LiveBid {
  id: string;
  auctionId: string;
  userId: string;
  amount: string;
  timestamp: string;
  userDisplayName?: string;
}

interface AuctionEvent {
  id: string;
  auctionId: string;
  type: string;
  userId?: string;
  data: any;
  timestamp: Date;
  message: string;
}

interface BidData {
  auctionId: string;
  bidId: string;
  userId: string;
  amount: number;
  timestamp: Date;
  isHighestBid: boolean;
}

function LiveBidding() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Use the existing auction hook
  const { auction, loading, error, refetch } = useAuction(id || "");

  // Use the Socket.IO hook
  const { socket, connected, emit, on, off } = useSocketIO(
    "http://localhost:3000",
    {
      namespace: "/auctions",
      autoConnect: true,
      transports: ["websocket"],
    }
  );

  // Live bidding states
  const [bidAmount, setBidAmount] = useState<string>("");
  const [submittingBid, setSubmittingBid] = useState(false);
  const [liveBids, setLiveBids] = useState<LiveBid[]>([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastBidAlert, setLastBidAlert] = useState<string | null>(null);
  const [events, setEvents] = useState<AuctionEvent[]>([]);
  const [userId] = useState(
    () =>
      localStorage.getItem("userId") ||
      `user_${Math.random().toString(36).substr(2, 9)}`
  );
  const [notifications, setNotifications] = useState(false);

  // Auto-scroll ref for bids list
  const bidsListRef = useRef<HTMLDivElement>(null);

  // Update connection status based on socket connection
  useEffect(() => {
    setConnectionStatus(connected ? "connected" : "disconnected");
  }, [connected]);

  // Set up Socket.IO event listeners
  useEffect(() => {
    if (!socket || !id) return;

    // Join auction room when connected
    if (connected) {
      emit("auction:join", {
        auctionId: id,
        userId: userId,
      });
    }

    // Set up event handlers
    const handleConnectionEstablished = (data: any) => {
      console.log("Connection established:", data);
      setConnectionStatus("connected");
    };

    const handleAuctionJoined = (data: any) => {
      console.log("Joined auction:", data);
      addEvent({
        id: "join_" + Date.now(),
        auctionId: data.auctionId,
        type: "USER_JOINED",
        userId: data.userId,
        data: data,
        timestamp: new Date(data.timestamp),
        message: `Joined auction successfully`,
      });
    };

    const handleBidPlaced = (data: BidData) => {
      console.log("Bid placed:", data);

      const newBid: LiveBid = {
        id: data.bidId,
        auctionId: data.auctionId,
        userId: data.userId,
        amount: data.amount.toString(),
        timestamp: data.timestamp.toISOString(),
      };

      setLiveBids((prev) => [newBid, ...prev.slice(0, 49)]);

      // Play sound notification
      if (soundEnabled && audioRef.current && data.userId !== userId) {
        audioRef.current.play().catch(console.error);
      }

      // Show alert for new highest bid
      if (data.userId !== userId) {
        setLastBidAlert(`Nueva oferta de ${formatPrice(data.amount)}`);
        setTimeout(() => setLastBidAlert(null), 3000);
      }

      addEvent({
        id: data.bidId,
        auctionId: data.auctionId,
        type: "BID_PLACED",
        userId: data.userId,
        data: data,
        timestamp: new Date(data.timestamp),
        message: `New bid: ${formatPrice(
          data.amount
        )} by ${data.userId.substring(0, 8)}`,
      });

      // Refresh auction data
      refetch();
    };

    const handleBidConfirm = (data: any) => {
      console.log("Bid placement confirmed:", data);
      setLastBidAlert("¡Tu oferta fue confirmada!");
      setTimeout(() => setLastBidAlert(null), 2000);

      addEvent({
        id: "confirm_" + data.bidId,
        auctionId: data.auctionId,
        type: "BID_CONFIRMED",
        data: data,
        timestamp: new Date(data.timestamp),
        message: `Your bid of ${formatPrice(
          data.amount
        )} was placed successfully`,
      });
    };

    const handleUserJoined = (data: any) => {
      console.log("User joined auction:", data);
      setOnlineUsers((prev) => prev + 1);

      addEvent({
        id: "user_join_" + Date.now(),
        auctionId: data.auctionId,
        type: "USER_JOINED",
        userId: data.userId,
        data: data,
        timestamp: new Date(data.timestamp),
        message: `User ${data.userId.substring(0, 8)} joined the auction`,
      });
    };

    const handleUserLeft = (data: any) => {
      console.log("User left auction:", data);
      setOnlineUsers((prev) => Math.max(0, prev - 1));

      addEvent({
        id: "user_leave_" + Date.now(),
        auctionId: data.auctionId,
        type: "USER_LEFT",
        userId: data.userId,
        data: data,
        timestamp: new Date(data.timestamp),
        message: `User ${data.userId.substring(0, 8)} left the auction`,
      });
    };

    const handleAuctionEnded = (data: any) => {
      console.log("Auction ended:", data);
      setLastBidAlert("¡Subasta finalizada!");
      refetch();

      addEvent({
        id: "ended_" + Date.now(),
        auctionId: data.auctionId,
        type: "AUCTION_ENDED",
        userId: data.winnerId,
        data: data,
        timestamp: new Date(data.timestamp),
        message: data.winnerId
          ? `Auction ended! Winner: ${data.winnerId.substring(
              0,
              8
            )} with ${formatPrice(data.winningBid)}`
          : "Auction ended with no bids",
      });
    };

    const handleError = (data: any) => {
      console.error("Socket error:", data);
      setLastBidAlert(`Error: ${data.message}`);
    };

    // Register event handlers
    on("connection:established", handleConnectionEstablished);
    on("auction:joined", handleAuctionJoined);
    on("bid:placed", handleBidPlaced);
    on("bid:placed-confirm", handleBidConfirm);
    on("user:joined", handleUserJoined);
    on("user:left", handleUserLeft);
    on("auction:ended", handleAuctionEnded);
    on("error", handleError);

    // Cleanup event handlers
    return () => {
      off("connection:established", handleConnectionEstablished);
      off("auction:joined", handleAuctionJoined);
      off("bid:placed", handleBidPlaced);
      off("bid:placed-confirm", handleBidConfirm);
      off("user:joined", handleUserJoined);
      off("user:left", handleUserLeft);
      off("auction:ended", handleAuctionEnded);
      off("error", handleError);
    };
  }, [socket, connected, id, userId, soundEnabled, emit, on, off]);

  // Initialize audio for notifications
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    audioRef.current.volume = 0.5;
  }, []);

  // Add event helper
  const addEvent = (event: AuctionEvent) => {
    setEvents((prev) => [...prev, event].slice(-50)); // Keep last 50 events
  };

  // Auto-scroll to latest bid
  useEffect(() => {
    if (bidsListRef.current) {
      bidsListRef.current.scrollTop = 0;
    }
  }, [liveBids]);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  // Get time remaining
  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return "Finalizada";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle bid submission
  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auction || !bidAmount || !socket) return;

    const amount = parseFloat(bidAmount);
    const minBid = auction.currentBid + parseFloat(auction.min_bid_increment);

    if (amount < minBid) {
      alert(`La oferta debe ser al menos ${formatPrice(minBid)}`);
      return;
    }

    try {
      setSubmittingBid(true);

      // Send bid through Socket.IO
      emit("bid:place", {
        auctionId: auction.id,
        userId: userId,
        amount: amount,
      });

      setBidAmount("");
      setLastBidAlert("¡Tu oferta fue enviada!");
      setTimeout(() => setLastBidAlert(null), 2000);
    } catch (error) {
      console.error("Error placing bid:", error);
      alert("Error al realizar la oferta");
    } finally {
      setSubmittingBid(false);
    }
  };

  // Add functionality for unused elements
  const handleNotificationToggle = () => {
    setNotifications(!notifications);
    if (!notifications) {
      // Request notification permission
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  };

  const handleShareAuction = () => {
    if (navigator.share) {
      navigator.share({
        title: auction?.title,
        text: `¡Mira esta subasta: ${auction?.title}!`,
        url: window.location.href,
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      setLastBidAlert("¡Enlace copiado al portapapeles!");
      setTimeout(() => setLastBidAlert(null), 2000);
    }
  };

  const handleRefreshData = () => {
    refetch();
    setLastBidAlert("Datos actualizados");
    setTimeout(() => setLastBidAlert(null), 1500);
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={600} />
      </Container>
    );
  }

  // Error state
  if (error || !auction) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Subasta no encontrada"}
        </Alert>
        <Button
          onClick={() => navigate("/auctions")}
          variant="contained"
          startIcon={<ArrowBackIcon />}
        >
          Volver a subastas
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Header with connection status */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          onClick={() => navigate("/auctions")}
          startIcon={<ArrowBackIcon />}
          size="small"
        >
          Volver
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            icon={
              connectionStatus === "connected" ? (
                <TrendingUpIcon />
              ) : (
                <RefreshIcon />
              )
            }
            label={
              connectionStatus === "connected" ? "En vivo" : "Reconectando..."
            }
            color={connectionStatus === "connected" ? "success" : "warning"}
            variant="filled"
          />

          <Badge badgeContent={onlineUsers} color="primary">
            <VisibilityIcon />
          </Badge>

          <IconButton
            onClick={handleNotificationToggle}
            color={notifications ? "primary" : "default"}
            size="small"
            title="Notificaciones"
          >
            {notifications ? (
              <NotificationsActiveIcon />
            ) : (
              <NotificationsIcon />
            )}
          </IconButton>

          <IconButton
            onClick={() => setSoundEnabled(!soundEnabled)}
            color={soundEnabled ? "primary" : "default"}
            size="small"
            title="Sonido"
          >
            {soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
          </IconButton>

          <IconButton
            onClick={handleRefreshData}
            size="small"
            title="Actualizar datos"
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Alert for new bids */}
      {lastBidAlert && (
        <Alert
          severity="info"
          sx={{ mb: 2, animation: "pulse 0.5s" }}
          onClose={() => setLastBidAlert(null)}
        >
          {lastBidAlert}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Left column - Auction info - Updated for MUI v7 */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ position: "relative" }}>
          <Card sx={{ mb: 2 }}>
            <CardMedia
              component="img"
              height="300"
              image={auction.images[0]}
              alt={auction.title}
            />
            {/* Add share button overlay */}
            <Box sx={{ position: "absolute", top: 8, right: 8 }}>
              <IconButton
                onClick={handleShareAuction}
                sx={{
                  bgcolor: "rgba(255,255,255,0.8)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                }}
                size="small"
              >
                <VisibilityIcon />
              </IconButton>
            </Box>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {auction.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {auction.description}
              </Typography>

              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <Chip label={auction.category} size="small" />
                <Chip label={auction.status} color="success" size="small" />
              </Box>

              {/* Live Events Feed */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Actividad en Vivo
                </Typography>
                <Box
                  sx={{
                    height: 200,
                    overflow: "auto",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 1,
                    bgcolor: "grey.50",
                  }}
                >
                  {events.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "center", py: 2 }}
                    >
                      No hay actividad reciente
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {events
                        .slice(-10)
                        .reverse()
                        .map((event) => (
                          <Box
                            key={event.id}
                            sx={{
                              p: 1,
                              bgcolor: "white",
                              borderRadius: 1,
                              borderLeft: 3,
                              borderColor:
                                event.type === "BID_PLACED"
                                  ? "success.main"
                                  : "primary.main",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {event.timestamp.toLocaleTimeString()}
                            </Typography>
                            <Typography variant="body2">
                              {event.message}
                            </Typography>
                          </Box>
                        ))}
                    </Stack>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right column - Live bidding - Updated for MUI v7 */}
        <Grid size={{ xs: 12, md: 6 }}>
          {/* Current bid display */}
          <Paper
            elevation={3}
            sx={{ p: 3, mb: 2, bgcolor: "primary.50", textAlign: "center" }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              OFERTA ACTUAL
            </Typography>
            <Typography variant="h3" fontWeight="bold" color="primary.main">
              {formatPrice(auction.currentBid)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {auction.bids.length + liveBids.length} ofertas
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
              }}
            >
              <TimeIcon color="warning" />
              <Typography variant="h6" color="warning.main" fontWeight="bold">
                {getTimeRemaining(auction.end_time)}
              </Typography>
            </Box>
          </Paper>

          {/* Bid form */}
          {auction.status === "active" && (
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Realizar Oferta
              </Typography>
              <Alert severity="info" sx={{ mb: 2, fontSize: "0.875rem" }}>
                Oferta mínima:{" "}
                {formatPrice(
                  auction.currentBid + parseFloat(auction.min_bid_increment)
                )}
              </Alert>

              <form onSubmit={handlePlaceBid}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Tu oferta"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    inputProps={{
                      min:
                        auction.currentBid +
                        parseFloat(auction.min_bid_increment),
                      step: "0.01",
                    }}
                    required
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <MoneyIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submittingBid || connectionStatus !== "connected"}
                    sx={{ minWidth: 100 }}
                  >
                    {submittingBid ? "..." : "Ofertar"}
                  </Button>
                </Box>
              </form>
            </Paper>
          )}

          {/* Live bids list */}
          <Paper
            elevation={1}
            sx={{ height: 400, display: "flex", flexDirection: "column" }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <Typography variant="h6">
                Ofertas en Vivo ({liveBids.length + auction.bids.length})
              </Typography>
            </Box>

            <Box
              ref={bidsListRef}
              sx={{
                flex: 1,
                overflow: "auto",
                "&::-webkit-scrollbar": { width: 6 },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(0,0,0,0.2)",
                  borderRadius: 3,
                },
              }}
            >
              <List dense>
                {/* Live bids (most recent) */}
                {liveBids.map((bid, index) => (
                  <ListItem
                    key={bid.id}
                    sx={{
                      bgcolor: index === 0 ? "success.50" : "transparent",
                      borderRadius: 1,
                      mx: 1,
                      mb: 0.5,
                      animation:
                        index < 3 ? "slideInRight 0.3s ease-out" : "none",
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: index === 0 ? "success.main" : "grey.400",
                          width: 32,
                          height: 32,
                        }}
                      >
                        {index === 0 ? (
                          <TrophyIcon fontSize="small" />
                        ) : (
                          index + 1
                        )}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={index === 0 ? 600 : 400}
                          >
                            Usuario {bid.userId.substring(0, 8)}
                            {index === 0 && (
                              <Chip
                                label="LÍDER"
                                color="success"
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            color={
                              index === 0 ? "success.main" : "text.primary"
                            }
                          >
                            {formatPrice(parseFloat(bid.amount))}
                          </Typography>
                        </Box>
                      }
                      secondary={new Date(bid.timestamp).toLocaleTimeString(
                        "es-CL"
                      )}
                    />
                  </ListItem>
                ))}

                {/* Historical bids */}
                {auction.bids.slice(liveBids.length).map((bid, index) => (
                  <ListItem key={bid.id} sx={{ mx: 1, mb: 0.5 }}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{ bgcolor: "grey.400", width: 32, height: 32 }}
                      >
                        {liveBids.length + index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body2">
                            Usuario {bid.user_id.substring(0, 8)}
                          </Typography>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {formatPrice(parseFloat(bid.amount))}
                          </Typography>
                        </Box>
                      }
                      secondary={new Date(bid.created_at).toLocaleTimeString(
                        "es-CL"
                      )}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Floating reconnect button */}
      {connectionStatus === "disconnected" && (
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          onClick={() => window.location.reload()}
        >
          <RefreshIcon />
        </Fab>
      )}
    </Container>
  );
}

export default LiveBidding;
