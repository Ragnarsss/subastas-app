import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert,
  LinearProgress,
  Skeleton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Gavel as GavelIcon,
  Person as PersonIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MoneyIcon,
  PhotoCamera as PhotoCameraIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";

// Tipos/interfaces
interface Auction {
  id: string;
  title: string;
  description: string;
  currentBid: number;
  minBid: number;
  endDate: string;
  images: string[];
  seller: {
    name: string;
    rating: number;
    avatar?: string;
  };
  bids: Bid[];
  status: "active" | "ended" | "upcoming";
  views: number;
  category: string;
}

interface Bid {
  id: string;
  amount: number;
  bidder: string;
  timestamp: string;
  isHighest?: boolean;
}

function AuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Estados
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [submittingBid, setSubmittingBid] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Efecto para cargar los datos de la subasta
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        setLoading(true);

        // TODO: Reemplazar con tu API real
        const mockAuction: Auction = {
          id: id || "1",
          title: "iPhone 15 Pro Max 256GB",
          description:
            "Nuevo iPhone 15 Pro Max de 256GB en color azul titanio. Sin usar, en caja original con todos los accesorios incluidos. Garantía de 1 año vigente.",
          currentBid: 950000,
          minBid: 1000000,
          endDate: "2025-06-25T15:30:00Z",
          images: [
            "https://via.placeholder.com/600x400",
            "https://via.placeholder.com/600x400/0000FF",
            "https://via.placeholder.com/600x400/FF0000",
          ],
          seller: {
            name: "Juan Pérez",
            rating: 4.8,
            avatar: "https://via.placeholder.com/40",
          },
          bids: [
            {
              id: "1",
              amount: 950000,
              bidder: "María González",
              timestamp: "2025-06-21T10:30:00Z",
              isHighest: true,
            },
            {
              id: "2",
              amount: 900000,
              bidder: "Carlos Morales",
              timestamp: "2025-06-21T09:15:00Z",
            },
            {
              id: "3",
              amount: 850000,
              bidder: "Ana Torres",
              timestamp: "2025-06-21T08:45:00Z",
            },
          ],
          status: "active",
          views: 156,
          category: "Electrónicos",
        };

        setAuction(mockAuction);
      } catch (err) {
        setError("Error al cargar la subasta");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAuction();
    }
  }, [id]);

  // Función para realizar una oferta
  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auction || !bidAmount) return;

    const amount = parseInt(bidAmount);
    if (amount <= auction.currentBid) {
      alert("La oferta debe ser mayor a la actual");
      return;
    }

    try {
      setSubmittingBid(true);

      // TODO: Llamada a tu API
      const newBid: Bid = {
        id: Date.now().toString(),
        amount,
        bidder: "Tú",
        timestamp: new Date().toISOString(),
        isHighest: true,
      };

      setAuction((prev) =>
        prev
          ? {
              ...prev,
              currentBid: amount,
              bids: [
                newBid,
                ...prev.bids.map((bid) => ({ ...bid, isHighest: false })),
              ],
            }
          : null
      );

      setBidAmount("");
      alert("¡Oferta realizada con éxito!");
    } catch (err) {
      alert("Error al realizar la oferta");
      console.error(err);
    } finally {
      setSubmittingBid(false);
    }
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
      active: { label: "Activa", color: "success" as const },
      ended: { label: "Finalizada", color: "default" as const },
      upcoming: { label: "Próximamente", color: "info" as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Chip
        label={config?.label || status}
        color={config?.color || "default"}
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
                    {getTimeRemaining(auction.endDate)}
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
                      {auction.views} vistas
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
            {/* Formulario para ofertar */}
            {auction.status === "active" && (
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Realizar Oferta
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  La oferta mínima es {formatPrice(auction.currentBid + 1000)}
                </Alert>
                <form onSubmit={handlePlaceBid}>
                  <Stack direction="row" spacing={2} alignItems="flex-end">
                    <TextField
                      fullWidth
                      type="number"
                      label="Tu oferta"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={formatPrice(auction.currentBid + 1000)}
                      inputProps={{ min: auction.currentBid + 1000 }}
                      required
                      InputProps={{
                        startAdornment: (
                          <MoneyIcon color="action" sx={{ mr: 1 }} />
                        ),
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submittingBid}
                      startIcon={<GavelIcon />}
                      sx={{ minWidth: 120, height: 56 }}
                    >
                      {submittingBid ? "Ofertando..." : "Ofertar"}
                    </Button>
                  </Stack>
                </form>
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>
      {/* Historial de ofertas */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Historial de Ofertas ({auction.bids.length})
        </Typography>

        {auction.bids.length > 0 ? (
          <List>
            {auction.bids.map((bid, index) => (
              <ListItem
                key={bid.id}
                sx={{
                  bgcolor: bid.isHighest ? "success.50" : "transparent",
                  borderRadius: 1,
                  mb: 1,
                  border: bid.isHighest ? 1 : 0,
                  borderColor: "success.200",
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: bid.isHighest ? "success.main" : "grey.400",
                    }}
                  >
                    {bid.isHighest ? <TrophyIcon /> : index + 1}
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
                        fontWeight={bid.isHighest ? 600 : 400}
                      >
                        {bid.bidder}
                        {bid.isHighest && (
                          <Chip
                            label="GANANDO"
                            color="success"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color={bid.isHighest ? "success.main" : "text.primary"}
                      >
                        {formatPrice(bid.amount)}
                      </Typography>
                    </Box>
                  }
                  secondary={new Date(bid.timestamp).toLocaleString("es-CL")}
                />
              </ListItem>
            ))}
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
    </Container>
  );
}

export default AuctionDetail;
