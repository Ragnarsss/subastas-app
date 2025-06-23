import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
  Paper,
  IconButton,
  Skeleton,
  ButtonGroup,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Gavel as GavelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import AuthDialog from "../../components/AuthDialog";
import { useAuth } from "../../contexts/AuthContext";

interface UserAuction {
  id: string;
  title: string;
  description: string;
  currentBid: number;
  minBid: number;
  startDate: string;
  endDate: string;
  image: string;
  status: "active" | "ended" | "upcoming" | "cancelled";
  totalBids: number;
  views: number;
}

type FilterType = "all" | "active" | "ended" | "upcoming" | "cancelled";

function MyAuctions() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [auctions, setAuctions] = useState<UserAuction[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<UserAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowAuthDialog(true);
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    const fetchMyAuctions = async () => {
      if (!user) return;

      try {
        // TODO: Fetch real auctions from API using user.id
        const mockAuctions: UserAuction[] = [
          {
            id: "1",
            title: "iPhone 15 Pro Max 256GB",
            description:
              "Nuevo iPhone 15 Pro Max de 256GB en color azul titanio",
            currentBid: 950000,
            minBid: 800000,
            startDate: "2025-01-15T10:00:00Z",
            endDate: "2025-01-25T20:00:00Z",
            image: "https://via.placeholder.com/300x200",
            status: "active",
            totalBids: 12,
            views: 156,
          },
          {
            id: "2",
            title: "MacBook Air M2",
            description: "MacBook Air con chip M2, 8GB RAM, 256GB SSD",
            currentBid: 850000,
            minBid: 700000,
            startDate: "2025-01-10T10:00:00Z",
            endDate: "2025-01-20T20:00:00Z",
            image: "https://via.placeholder.com/300x200",
            status: "ended",
            totalBids: 8,
            views: 89,
          },
          {
            id: "3",
            title: "Samsung Galaxy S24 Ultra",
            description: "Samsung Galaxy S24 Ultra 512GB, color negro",
            currentBid: 0,
            minBid: 600000,
            startDate: "2025-01-30T10:00:00Z",
            endDate: "2025-02-10T20:00:00Z",
            image: "https://via.placeholder.com/300x200",
            status: "upcoming",
            totalBids: 0,
            views: 23,
          },
          {
            id: "4",
            title: "iPad Pro 12.9",
            description: "iPad Pro 12.9 pulgadas con M2, 128GB",
            currentBid: 0,
            minBid: 500000,
            startDate: "2025-01-05T10:00:00Z",
            endDate: "2025-01-15T20:00:00Z",
            image: "https://via.placeholder.com/300x200",
            status: "cancelled",
            totalBids: 0,
            views: 12,
          },
        ];

        setAuctions(mockAuctions);
      } catch (error) {
        console.error("Error fetching auctions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAuctions();
  }, [user]);

  // Show auth dialog if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <AuthDialog
        open={showAuthDialog}
        onClose={() => {
          setShowAuthDialog(false);
          navigate("/");
        }}
        title="Acceso Restringido"
        message="Para ver tus subastas necesitas iniciar sesión."
        action="ver tus subastas"
      />
    );
  }

  useEffect(() => {
    if (filter === "all") {
      setFilteredAuctions(auctions);
    } else {
      setFilteredAuctions(
        auctions.filter((auction) => auction.status === filter)
      );
    }
  }, [auctions, filter]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      active: { label: "Activa", color: "success" as const, icon: "🟢" },
      ended: { label: "Finalizada", color: "default" as const, icon: "⚫" },
      upcoming: { label: "Próxima", color: "info" as const, icon: "🔵" },
      cancelled: { label: "Cancelada", color: "error" as const, icon: "🔴" },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Chip
        label={config?.label || status}
        color={config?.color || "default"}
        size="small"
        sx={{ fontWeight: 600 }}
      />
    );
  };

  const getFilterCounts = () => {
    return {
      all: auctions.length,
      active: auctions.filter((a) => a.status === "active").length,
      ended: auctions.filter((a) => a.status === "ended").length,
      upcoming: auctions.filter((a) => a.status === "upcoming").length,
      cancelled: auctions.filter((a) => a.status === "cancelled").length,
    };
  };

  const handleDeleteAuction = async (auctionId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta subasta?")) {
      try {
        // TODO: Call API to delete auction
        setAuctions((prev) =>
          prev.filter((auction) => auction.id !== auctionId)
        );
      } catch (error) {
        console.error("Error deleting auction:", error);
        alert("Error al eliminar la subasta");
      }
    }
  };

  const counts = getFilterCounts();

  if (authLoading || loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/profile")}
          sx={{ mb: 2 }}
        >
          Volver al perfil
        </Button>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
          >
            Mis Subastas
          </Typography>
          <Button
            component={Link}
            to="/auctions/create"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2 }}
          >
            Nueva Subasta
          </Button>
        </Box>

        {/* Filtros */}
        <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50" }}>
          <ButtonGroup
            variant="outlined"
            sx={{ flexWrap: "wrap", gap: 1, justifyContent: "center" }}
          >
            <Button
              variant={filter === "all" ? "contained" : "outlined"}
              onClick={() => setFilter("all")}
            >
              Todas ({counts.all})
            </Button>
            <Button
              variant={filter === "active" ? "contained" : "outlined"}
              onClick={() => setFilter("active")}
            >
              Activas ({counts.active})
            </Button>
            <Button
              variant={filter === "ended" ? "contained" : "outlined"}
              onClick={() => setFilter("ended")}
            >
              Finalizadas ({counts.ended})
            </Button>
            <Button
              variant={filter === "upcoming" ? "contained" : "outlined"}
              onClick={() => setFilter("upcoming")}
            >
              Próximas ({counts.upcoming})
            </Button>
            <Button
              variant={filter === "cancelled" ? "contained" : "outlined"}
              onClick={() => setFilter("cancelled")}
            >
              Canceladas ({counts.cancelled})
            </Button>
          </ButtonGroup>
        </Paper>
      </Box>

      {/* Lista de subastas */}
      {filteredAuctions.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tienes subastas {filter !== "all" ? `en estado ${filter}` : ""}
          </Typography>
          <Button
            component={Link}
            to="/auctions/create"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Crear mi primera subasta
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredAuctions.map((auction) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={auction.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={auction.image}
                    alt={auction.title}
                    sx={{ borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
                  />
                  <Box sx={{ position: "absolute", top: 16, right: 16 }}>
                    {getStatusChip(auction.status)}
                  </Box>
                </Box>

                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    p: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    fontWeight="bold"
                    sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                  >
                    {auction.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, flexGrow: 1 }}
                  >
                    {auction.description}
                  </Typography>

                  {/* Información del vendedor - Tú */}
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        sx={{ width: 20, height: 20, bgcolor: "primary.main" }}
                      >
                        T
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">
                        Tu subasta
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Estadísticas */}
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          bgcolor: "primary.light",
                          p: 1,
                          borderRadius: 1,
                        }}
                      >
                        <GavelIcon fontSize="small" color="primary" />
                        <Typography variant="body2">
                          {auction.currentBid > 0
                            ? formatPrice(auction.currentBid)
                            : "Sin ofertas"}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={2}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          bgcolor: "success.light",
                          p: 1,
                          borderRadius: 1,
                        }}
                      >
                        <TrendingUpIcon fontSize="small" color="success" />
                        <Typography variant="caption">
                          {auction.totalBids} ofertas
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          bgcolor: "info.light",
                          p: 1,
                          borderRadius: 1,
                        }}
                      >
                        <VisibilityIcon fontSize="small" color="info" />
                        <Typography variant="caption">
                          {auction.views} vistas
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Fechas */}
                  <Box sx={{ mb: 2 }}>
                    <Stack spacing={1}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          bgcolor: "action.hover",
                          p: 1,
                          borderRadius: 1,
                        }}
                      >
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          Inicio: {formatDate(auction.startDate)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          bgcolor: "action.hover",
                          p: 1,
                          borderRadius: 1,
                        }}
                      >
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          Fin: {formatDate(auction.endDate)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Acciones */}
                  <Stack direction="row" spacing={1} sx={{ mt: "auto" }}>
                    <Button
                      component={Link}
                      to={`/auctions/${auction.id}`}
                      variant="outlined"
                      size="small"
                      fullWidth
                    >
                      Ver Detalles
                    </Button>

                    {auction.status === "upcoming" && (
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                    )}

                    {["upcoming", "cancelled"].includes(auction.status) && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteAuction(auction.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default MyAuctions;
