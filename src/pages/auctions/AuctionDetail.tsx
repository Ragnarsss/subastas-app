import {
  ArrowBack as ArrowBackIcon,
  Bolt as BoltIcon,
  Gavel as GavelIcon,
  MonetizationOn as MoneyIcon,
  Person as PersonIcon,
  PhotoCamera as PhotoCameraIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuthDialog from "../../components/AuthDialog";
import { useAuth } from "../../contexts/AuthContext";
import { useAuction } from "../../hooks/useAuctions";
import { useAuctionAPI } from "../../hooks/useAuctionAPI";
import "./AuctionDetail.css";

function AuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Use the custom hooks
  const { auction, loading, error, refetch, clearError } = useAuction(id || "");
  const {
    createBid,
    loading: bidLoading,
    error: bidError,
    clearError: clearBidError,
  } = useAuctionAPI();

  // Estados locales
  const [bidAmount, setBidAmount] = useState<string>("");
  const [submittingBid, setSubmittingBid] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Función para realizar una oferta
  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      setShowAuthDialog(true);
      return;
    }

    if (!auction || !bidAmount) return;

    const amount = parseFloat(bidAmount);
    const minBid = auction.currentBid + parseFloat(auction.min_bid_increment);

    if (amount < minBid) {
      alert(`La oferta debe ser al menos ${formatPrice(minBid)}`);
      return;
    }

    try {
      setSubmittingBid(true);
      clearBidError();

      // Use the auction API to create bid
      const result = await createBid(auction.id, {
        user_id: user.id,
        amount: amount.toString(),
      });

      if (result.success) {
        // Refetch auction data to get updated bids and highest bid
        await refetch();
        setBidAmount("");
        alert("¡Oferta realizada con éxito!");
      } else {
        throw new Error(result.error || "Error al procesar la oferta");
      }
    } catch (err) {
      alert("Error al realizar la oferta");
      console.error(err);
    } finally {
      setSubmittingBid(false);
    }
  };

  // Handle bid button click for unauthenticated users
  const handleBidClick = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    // If authenticated, focus on the input
    document.getElementById("bid-amount-input")?.focus();
  };

  // Handle live bidding click
  const handleLiveBidClick = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    navigate(`/auctions/live/${auction?.id}`);
  };

  // Check if current user is the highest bidder
  const isCurrentUserHighestBidder = () => {
    if (!user || !auction?.bids.length) return false;

    // Sort bids by amount to get the highest
    const sortedBids = [...auction.bids].sort(
      (a, b) => parseFloat(b.amount) - parseFloat(a.amount)
    );
    const highestBid = sortedBids[0];

    return highestBid?.user_id === user.id;
  };

  // Get user's bid history for this auction
  const getUserBids = () => {
    if (!user || !auction?.bids.length) return [];

    return auction.bids
      .filter((bid) => bid.user_id === user.id)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  };

  // Función para formatear precios
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  // Función para calcular tiempo restante
  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return "Subasta terminada";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    return `${hours}h ${minutes}m`;
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendiente", color: "warning" as const },
      active: { label: "Activa", color: "success" as const },
      completed: { label: "Completada", color: "default" as const },
      cancelled: { label: "Cancelada", color: "error" as const },
      // Keep old values for backward compatibility
      ACTIVE: { label: "Activa", color: "success" as const },
      ENDED: { label: "Finalizada", color: "default" as const },
      Hello: { label: "Activa", color: "success" as const }, // Handle test data
    };
    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      color: "default" as const,
    };
    return (
      <Chip
        label={config.label}
        color={config.color}
        sx={{ fontWeight: 600 }}
      />
    );
  };

  // Estados de carga y error
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton
              variant="rectangular"
              height={400}
              sx={{ borderRadius: 2 }}
            />
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              {[1, 2, 3].map((item) => (
                <Skeleton
                  key={item}
                  variant="rectangular"
                  width={80}
                  height={60}
                  sx={{ borderRadius: 1 }}
                />
              ))}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="80%" height={20} />
            <Box sx={{ mt: 3 }}>
              <Skeleton
                variant="rectangular"
                height={120}
                sx={{ borderRadius: 2 }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !auction) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb y navegación */}
      <Box sx={{ mb: 3 }}>
        <Button
          onClick={() => navigate("/auctions")}
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Volver a subastas
        </Button>
      </Box>{" "}
      <Grid container spacing={4}>
        {/* Columna izquierda - Imágenes */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ mb: 2 }}>
            <CardMedia
              component="img"
              height={400}
              image={auction.images[selectedImageIndex]}
              alt={auction.title}
              sx={{ objectFit: "cover" }}
            />
          </Card>{" "}
          {/* Thumbnails */}
          {auction.images.length > 1 && (
            <Box sx={{ display: "flex", gap: 1, overflowX: "auto" }}>
              {auction.images.map((image, index) => (
                <Card
                  key={index}
                  sx={{
                    minWidth: 80,
                    cursor: "pointer",
                    border: selectedImageIndex === index ? 2 : 1,
                    borderColor:
                      selectedImageIndex === index
                        ? "primary.main"
                        : "grey.300",
                    position: "relative",
                  }}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <CardMedia
                    component="img"
                    height={60}
                    image={image}
                    alt={`${auction.title} ${index + 1}`}
                  />
                  {selectedImageIndex === index && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "primary.main",
                        borderRadius: "50%",
                        p: 0.5,
                      }}
                    >
                      <PhotoCameraIcon sx={{ fontSize: 12, color: "white" }} />
                    </Box>
                  )}
                </Card>
              ))}
            </Box>
          )}
        </Grid>{" "}
        {/* Columna derecha - Información */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={3}>
            {" "}
            {/* Header de la subasta */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Typography variant="h4" component="h1" fontWeight="bold">
                  {auction.title}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  {getStatusChip(auction.status)}
                  <IconButton
                    color="primary"
                    size="small"
                    title="Compartir subasta"
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Box>
              </Box>

              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip
                  label={auction.category}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label={`${auction.views} vistas`}
                  icon={<VisibilityIcon />}
                  variant="outlined"
                  size="small"
                  color="info"
                />
              </Stack>
            </Box>
            {/* Información del vendedor */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50" }}>
              <Typography variant="h6" gutterBottom>
                <PersonIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Vendedor
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar src={auction.seller.avatar}>
                  {auction.seller.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {auction.seller.name}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <StarIcon color="warning" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {auction.seller.rating}/5
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>{" "}
            {/* Descripción */}
            <Card
              elevation={0}
              sx={{
                bgcolor: "background.paper",
                border: 1,
                borderColor: "grey.200",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Descripción del Producto
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {auction.description}
                </Typography>
              </CardContent>
            </Card>
            {/* Información de la oferta actual */}
            <Paper
              elevation={2}
              sx={{
                p: 3,
                bgcolor: "primary.50",
                border: 1,
                borderColor: "primary.200",
              }}
            >
              <Stack spacing={2}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    OFERTA ACTUAL
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    {formatPrice(auction.currentBid)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {auction.bids.length} ofertas realizadas
                  </Typography>
                </Box>
                <Divider /> {/* Tiempo restante */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <TimeIcon color="warning" />
                  <Typography
                    variant="h6"
                    color="warning.main"
                    fontWeight="bold"
                  >
                    {getTimeRemaining(auction.end_time)}
                  </Typography>
                </Box>
                {/* Progreso de tiempo */}
                <Box sx={{ px: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: "block" }}
                  >
                    Progreso de la subasta
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={75} // Puedes calcular esto basado en tiempo transcurrido
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "grey.200",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 4,
                        bgcolor: "warning.main",
                      },
                    }}
                  />
                </Box>
                {/* Estadísticas */}
                <Stack direction="row" spacing={3} justifyContent="center">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <VisibilityIcon fontSize="small" color="info" />
                    <Typography variant="caption">
                      {auction.views || 0} vistas
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <TrendingUpIcon fontSize="small" color="success" />
                    <Typography variant="caption">
                      {auction.bids.length} ofertas
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Paper>
            {/* Current user's bidding status */}
            {isAuthenticated && user && auction && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "info.50",
                  border: 1,
                  borderColor: "info.200",
                }}
              >
                <Typography variant="subtitle2" color="info.main" gutterBottom>
                  Tu estado en esta subasta
                </Typography>

                {getUserBids().length > 0 ? (
                  <Box>
                    {isCurrentUserHighestBidder() ? (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        🏆 ¡Estás ganando! Tu oferta de{" "}
                        {formatPrice(parseFloat(getUserBids()[0].amount))} es la
                        más alta.
                      </Alert>
                    ) : (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        ⚠️ Tu oferta de{" "}
                        {formatPrice(parseFloat(getUserBids()[0].amount))} ha
                        sido superada.
                      </Alert>
                    )}

                    <Typography variant="body2" color="text.secondary">
                      Ofertas realizadas: {getUserBids().length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Última oferta:{" "}
                      {formatPrice(parseFloat(getUserBids()[0].amount))}
                      el{" "}
                      {new Date(getUserBids()[0].created_at).toLocaleDateString(
                        "es-CL"
                      )}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aún no has participado en esta subasta
                  </Typography>
                )}
              </Paper>
            )}
            {/* Formulario para ofertar */}
            {(auction?.status === "active" ||
              auction?.status === "ACTIVE" ||
              auction?.status === "Hello") && (
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Realizar Oferta
                </Typography>

                {/* Bid error alert */}
                {bidError && (
                  <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    onClose={clearBidError}
                  >
                    {bidError}
                  </Alert>
                )}

                {/* Live bidding button */}
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      La oferta mínima es{" "}
                      {formatPrice(
                        auction.currentBid +
                          parseFloat(auction.min_bid_increment)
                      )}
                    </span>
                    <Button
                      onClick={handleLiveBidClick}
                      variant="contained"
                      size="small"
                      startIcon={<BoltIcon />}
                      sx={{ ml: 2 }}
                    >
                      Puja en Vivo
                    </Button>
                  </Box>
                </Alert>

                {isAuthenticated ? (
                  <form onSubmit={handlePlaceBid}>
                    <Stack direction="row" spacing={2} alignItems="flex-end">
                      <TextField
                        id="bid-amount-input"
                        fullWidth
                        type="number"
                        label="Tu oferta"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={formatPrice(
                          auction.currentBid +
                            parseFloat(auction.min_bid_increment)
                        )}
                        inputProps={{
                          min:
                            auction.currentBid +
                            parseFloat(auction.min_bid_increment),
                          step: "1000", // Step in CLP
                        }}
                        required
                        helperText={
                          isCurrentUserHighestBidder()
                            ? "Ya tienes la oferta más alta"
                            : `Incremento mínimo: ${formatPrice(
                                parseFloat(auction.min_bid_increment)
                              )}`
                        }
                        InputProps={{
                          startAdornment: (
                            <MoneyIcon color="action" sx={{ mr: 1 }} />
                          ),
                        }}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={submittingBid || bidLoading}
                        startIcon={<GavelIcon />}
                        sx={{ minWidth: 120, height: 56 }}
                        color={
                          isCurrentUserHighestBidder() ? "success" : "primary"
                        }
                      >
                        {submittingBid || bidLoading
                          ? "Ofertando..."
                          : isCurrentUserHighestBidder()
                          ? "Aumentar"
                          : "Ofertar"}
                      </Button>
                    </Stack>
                  </form>
                ) : (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      gutterBottom
                    >
                      Para realizar una oferta necesitas iniciar sesión
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleBidClick}
                      startIcon={<GavelIcon />}
                      sx={{ mt: 2 }}
                    >
                      Iniciar Sesión para Ofertar
                    </Button>
                  </Box>
                )}
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>
      {/* Enhanced bid history with user highlighting */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Historial de Ofertas ({auction.bids.length})
        </Typography>

        {auction.bids.length > 0 ? (
          <List>
            {auction.bids.map((bid, index) => {
              const isUserBid = user && bid.user_id === user.id;
              const isHighestBid = index === 0;

              return (
                <ListItem
                  key={bid.id}
                  sx={{
                    bgcolor: isHighestBid
                      ? "success.50"
                      : isUserBid
                      ? "primary.50"
                      : "transparent",
                    borderRadius: 1,
                    mb: 1,
                    border: isHighestBid ? 1 : isUserBid ? 1 : 0,
                    borderColor: isHighestBid
                      ? "success.200"
                      : isUserBid
                      ? "primary.200"
                      : "transparent",
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: isHighestBid
                          ? "success.main"
                          : isUserBid
                          ? "primary.main"
                          : "grey.400",
                      }}
                    >
                      {isHighestBid ? (
                        <TrophyIcon />
                      ) : isUserBid ? (
                        user.name.charAt(0)
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
                          variant="body1"
                          fontWeight={isHighestBid || isUserBid ? 600 : 400}
                        >
                          {isUserBid
                            ? `${user.name} (Tú)`
                            : `Usuario ${bid.user_id.substring(0, 8)}`}
                          {isHighestBid && (
                            <Chip
                              label="GANANDO"
                              color="success"
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                          {isUserBid && !isHighestBid && (
                            <Chip
                              label="TU OFERTA"
                              color="primary"
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={
                            isHighestBid
                              ? "success.main"
                              : isUserBid
                              ? "primary.main"
                              : "text.primary"
                          }
                        >
                          {formatPrice(parseFloat(bid.amount))}
                        </Typography>
                      </Box>
                    }
                    secondary={new Date(bid.created_at).toLocaleString("es-CL")}
                  />
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <GavelIcon sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No hay ofertas aún. ¡Sé el primero en ofertar!
            </Typography>
          </Box>
        )}
      </Paper>
      {/* Auth Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        title="Iniciar Sesión para Participar"
        message="Para realizar ofertas en las subastas necesitas tener una cuenta."
        action="participar en subastas"
      />
    </Container>
  );
}

export default AuctionDetail;
